import os
import time
import uuid
import hashlib
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import User, Lecture
from .ai_helper import generate_lecture_study_material, ask_question_about_lecture

# Helper para gerar hash de senha PBKDF2 similar ao Node.js / crypto
def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('utf-8'), 1000, dklen=64)
    return f"{salt}:{dk.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    if ":" not in stored_hash:
        # Suporte a hashes legados SHA256 comuns
        legacy_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
        return stored_hash == legacy_hash
    salt, hash_val = stored_hash.split(":")
    dk = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('utf-8'), 1000, dklen=64)
    return dk.hex() == hash_val

# Controle simples de tentativas e limites de geração (Rate Limiting em memória)
RATE_LIMIT_SESSIONS = {}

def check_rate_limit(ident: str, limit=60) -> bool:
    now = time.time()
    if ident not in RATE_LIMIT_SESSIONS:
        RATE_LIMIT_SESSIONS[ident] = []
    
    # Limpa registros antigos (anteriores a 1 minuto)
    RATE_LIMIT_SESSIONS[ident] = [t for t in RATE_LIMIT_SESSIONS[ident] if now - t < 60]
    
    # Valida se excedeu o limite do minuto
    if len(RATE_LIMIT_SESSIONS[ident]) >= limit:
        return False
    
    RATE_LIMIT_SESSIONS[ident].append(now)
    return True


@csrf_exempt
@api_view(['GET'])
def auth_me(request):
    """
    Recupera os dados salvos na sessão do usuário atual por meio de Cookies.
    """
    session_id = request.COOKIES.get('newstudy_session')
    if not session_id:
        return Response(
            {"error": "Sessão expirada ou não autenticada por cookies."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(id=session_id)
        return Response({
            "success": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            }
        })
    except User.DoesNotExist:
        return Response(
            {"error": "Usuário da sessão não foi localizado no sistema."},
            status=status.HTTP_401_UNAUTHORIZED
        )


@csrf_exempt
@api_view(['POST'])
def auth_register(request):
    """
    Registra um novo usuário e define automaticamente os cookies de sessão.
    """
    data = request.data
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return Response(
            {"error": "Todos os campos (nome, email e senha) são obrigatórios para a conta."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 6:
        return Response(
            {"error": "A senha de acesso deve possuir o tamanho mínimo de 6 caracteres."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Este endereço de email já está sendo utilizado por outro cadastro."},
            status=status.HTTP_409_CONFLICT
        )

    # Criação do usuário
    user_id = f"user-{int(time.time())}-{uuid.uuid4().hex[:8]}"
    pwd_hash = hash_password(password)

    user = User.objects.create(
        id=user_id,
        name=name,
        email=email,
        password_hash=pwd_hash
    )

    response = Response({
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
    }, status=status.HTTP_201_CREATED)

    # Injeta cookie de sessão compatível com Cross-Domain em iframes
    response.set_cookie(
        key='newstudy_session',
        value=user.id,
        max_age=31536000,
        httponly=True,
        samesite='None',
        secure=True
    )
    return response


@csrf_exempt
@api_view(['POST'])
def auth_login(request):
    """
    Autentica credenciais do usuário.
    """
    # Rate limit simples de tentativas de login
    ip = request.META.get('REMOTE_ADDR', 'unknown-ip')
    if not check_rate_limit(f"login-{ip}", limit=30):
        return Response(
            {"error": "Muitas tentativas de login consecutivas. Aguarde 60 segundos."},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    data = request.data
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return Response(
            {"error": "Preencha o email e senha correspondentes ao seu cadastro."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        if not verify_password(password, user.password_hash):
            raise User.DoesNotExist()
    except User.DoesNotExist:
        return Response(
            {"error": "As credenciais inseridas estão incorretas ou não cadastradas."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    response = Response({
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
    })

    # Injeta cookie de sessão compatível com Cross-Domain em iframes
    response.set_cookie(
        key='newstudy_session',
        value=user.id,
        max_age=31536000,
        httponly=True,
        samesite='None',
        secure=True
    )
    return response


@csrf_exempt
@api_view(['POST'])
def auth_logout(request):
    """
    Efetua o logout do usuário limpando o cookie de sessão.
    """
    response = Response({"success": True})
    response.set_cookie(
        key='newstudy_session',
        value='',
        max_age=0,
        httponly=True,
        samesite='None',
        secure=True
    )
    return response


@csrf_exempt
@api_view(['GET'])
def usage_statistics(request):
    """
    Retorna as cotas de segurança e status do plano atual no backend.
    """
    session_id = request.COOKIES.get('newstudy_session', 'system')
    saved_count = Lecture.objects.filter(user_id=session_id).count()

    # Estrutura padrão de cotas e limites enviada ao frontend
    return Response({
        "generationLimit": {
            "allowed": True,
            "used": 1,
            "limit": 10,
            "remaining": 9,
            "resetHours": 24
        },
        "questionLimit": {
            "allowed": True,
            "used": 0,
            "limit": 50,
            "remaining": 50,
            "resetHours": 24
        },
        "registrationLimit": {
            "allowed": True,
            "used": 1,
            "limit": 5,
            "remaining": 4,
            "resetHours": 24
        },
        "plan": "Estudante Livre",
        "savedLecturesCount": saved_count
    })


@csrf_exempt
@api_view(['GET', 'POST'])
def lecture_list_create(request):
    """
    Lista todos os módulos de estudo ou solicita a geração de um novo material via Gemini.
    """
    if request.method == 'GET':
        user_id = request.query_params.get('userId')
        if user_id:
            lectures = Lecture.objects.filter(user_id=user_id).order_by('-created_at')
        else:
            lectures = Lecture.objects.all().order_by('-created_at')
        
        # Mapeia para retornar o objeto JSON 'data' para compatibilidade com o frontend
        result = []
        for l in lectures:
            # Garante que o ID no campo data esteja sincronizado com o ID da tabela
            lecture_data = l.data
            lecture_data['id'] = l.id
            lecture_data['userId'] = l.user_id
            result.append(lecture_data)
            
        return Response(result)

    elif request.method == 'POST':
        # Rate Limiting de geração cara para evitar abuso
        ip = request.META.get('REMOTE_ADDR', 'unknown-ip')
        if not check_rate_limit(f"gen-{ip}", limit=5):
            return Response(
                {"error": "Você atingiu o limite de geração de novos materiais (max 5/min). Por favor, aguarde alguns instantes."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        data = request.data
        url = data.get('url', '').strip()
        topic_hint = data.get('topicHint', '').strip()
        user_id = data.get('userId') or request.COOKIES.get('newstudy_session', 'system')

        # Proteção contra inchaço (max 15 módulos por usuário)
        if user_id != 'system' and Lecture.objects.filter(user_id=user_id).count() >= 15:
            return Response(
                {"error": "Limite de Seguranca Excedido: Seu deck pessoal possui o limite maximo de 15 módulos de estudo carregados simultaneamente. Exclua um modulo antigo para gerar mais."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not url:
            return Response(
                {"error": "O campo link de origem ou tema central da aula é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Chama o motor inteligente do Gemini
            generated_material = generate_lecture_study_material(url, topic_hint)
            
            # Enriquece o objeto retornado de volta
            lecture_id = f"lecture-{int(time.time())}-{uuid.uuid4().hex[:4]}"
            generated_material['id'] = lecture_id
            generated_material['userId'] = user_id
            generated_material['sourceUrl'] = url
            generated_material['status'] = 'READY'
            generated_material['progress'] = 100
            generated_material['chatHistory'] = []
            
            # Salva no banco de dados Postgres via modelo Django
            Lecture.objects.create(
                id=lecture_id,
                user_id=user_id,
                data=generated_material
            )

            return Response(generated_material, status=status.HTTP_201_CREATED)
        except Exception as err:
            return Response(
                {"error": f"Falha na geração inteligente com o Gemini API: {str(err)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@csrf_exempt
@api_view(['GET', 'DELETE'])
def lecture_detail_delete(request, pk):
    """
    Recupera um material de estudos por id ou exclui ele do banco.
    """
    try:
        lecture = Lecture.objects.get(id=pk)
    except Lecture.DoesNotExist:
        return Response(
            {"error": "Módulo de estudo não encontrado no banco de dados."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        lecture_data = lecture.data
        lecture_data['id'] = lecture.id
        lecture_data['userId'] = lecture.user_id
        return Response(lecture_data)

    elif request.method == 'DELETE':
        lecture.delete()
        return Response({"success": True})


@csrf_exempt
@api_view(['POST'])
def flashcard_review(request, pk):
    """
    Altera a dificuldade ou estado de revisão marcados em um flashcard específico.
    """
    try:
        lecture = Lecture.objects.get(id=pk)
    except Lecture.DoesNotExist:
        return Response(
            {"error": "Módulo de estudo correspondente não encontrado."},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data
    fc_id = data.get('flashcardId')
    difficulty = data.get('difficulty')
    review_state = data.get('reviewState')

    lecture_data = lecture.data
    flashcards = lecture_data.get('flashcards', [])

    found = False
    for fc in flashcards:
        if fc.get('id') == fc_id:
            if difficulty is not None:
                fc['difficulty'] = difficulty
            if review_state is not None:
                fc['reviewState'] = review_state
            found = True
            break

    if not found:
         return Response(
            {"error": "Flashcard solicitado não localizado no módulo."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Grava as alterações de volta no PostgreSQL
    lecture.data = lecture_data
    lecture.save()

    lecture_data['id'] = lecture.id
    lecture_data['userId'] = lecture.user_id
    
    return Response({"success": True, "lecture": lecture_data})


@csrf_exempt
@api_view(['POST'])
def ask_question(request, pk):
    """
    Envia uma pergunta sobre as anotações geradas ao tutor assistente via Inteligência Artificial.
    """
    try:
        lecture = Lecture.objects.get(id=pk)
    except Lecture.DoesNotExist:
        return Response(
            {"error": "Conteúdo acadêmico correspondente não identificado no sistema."},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data
    question = data.get('question', '').strip()
    
    if not question:
        return Response(
            {"error": "Pergunta de contexto não formulada ou vazia."},
            status=status.HTTP_400_BAD_REQUEST
        )

    lecture_data = lecture.data
    chat_history = lecture_data.get('chatHistory', [])

    try:
        # Aciona o resolvedor Python que consome de forma assíncrona/recorrente a Gemini API
        answer = ask_question_about_lecture(
            lecture_title=lecture_data.get('title', 'Aula'),
            lecture_summary=lecture_data.get('summaryFull', ''),
            key_concept=lecture_data.get('keyConcept', {}),
            question=question,
            chat_history=chat_history
        )

        formatted_time = time.strftime("%H:%M")
        
        user_msg = {"sender": "user", "text": question, "timestamp": formatted_time}
        ai_msg = {"sender": "ai", "text": answer, "timestamp": formatted_time}

        chat_history.extend([user_msg, ai_msg])
        lecture_data['chatHistory'] = chat_history

        # Atualiza banco de dados Postgres
        lecture.data = lecture_data
        lecture.save()

        return Response({
            "answer": answer,
            "chatHistory": chat_history
        })
    except Exception as err:
        return Response(
            {"error": f"Falha na resposta inteligente com o assistente: {str(err)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
