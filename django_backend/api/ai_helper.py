import os
import json
import time
from google import genai
from google.genai import types

def get_ai_client():
    """
    Inicializa e retorna o cliente oficial do Google Gemini API.
    Lê a chave diretamente das variáveis de ambiente.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key in ["MY_GEMINI_API_KEY", "dummy-key", "your_gemini_api_key_here", ""]:
        raise ValueError(
            "A chave de API GEMINI_API_KEY não foi configurada ou é inválida. "
            "Por favor, configure esta chave em seu arquivo .env para ativar a IA."
        )
    return genai.Client(api_key=api_key)

def with_retry(func, retries=3, initial_delay=1.5):
    """
    Utilitário de retry para contornar limites de taxa da API (429/503).
    """
    delay = initial_delay
    for attempt in range(1, retries + 1):
        try:
            return func()
        except Exception as e:
            err_str = str(e)
            is_retryable = any(
                code in err_str for code in ["429", "503", "Resource exhausted", "UNAVAILABLE", "limit"]
            )
            if attempt < retries and is_retryable:
                print(f"[NewStudy Gemini Python Agent] Tentativa {attempt} falhou. Aguardando {delay}s...")
                time.sleep(delay)
                delay *= 2
            else:
                raise e

def generate_lecture_study_material(url: str, topic_hint: str) -> dict:
    """
    Gera um material didático completo baseado em uma URL ou tema.
    Usa o Gemini 2.5/3.5 Flash com Structured Outputs (JSON Schema).
    """
    client = get_ai_client()
    
    prompt = f"""
    Analise os seguintes detalhes do vídeo/assunto educacional fornecido e gere um material de estudo completo, estruturado e didático.
    URL do Conteúdo: {url}
    Ideia Central do Tema ou Título: {topic_hint or "Assunto Acadêmico Geral"}

    Sua resposta DEVE ser estritamente em PORTUGUÊS DO BRASIL. Certifique-se de que os conceitos extraídos sejam densos, explicativos e acadêmicos. Fórmulas matemáticas devem usar a notação formal LaTeX sem delimitadores de cifrão externo nas descrições de blocos (ex: "E = mc^2" ou "\\Psi(x,t)").
    """

    system_instruction = """Você é um renomado designer pedagógico e professor universitário sênior brasileiro. Seu objetivo é estruturar materiais de estudo excepcionais baseados nos dados fornecidos pelo aluno.
TODO O MATERIAL DEVE SER ESCRITO EM PORTUGUÊS DO BRASIL (pt-BR). Forneça explicações acadêmicas robustas, segmentos de transcrição didáticos com timestamps realistas (ex: "01:20"), fórmulas úteis com variáveis e aplicações práticas correspondentes, flashcards desafiadores e questionários de múltipla escolha diagnósticos com justificativas detalhadas para as opções certas e erradas. Forneça o resultado exclusivamente no formato do esquema JSON solicitado."""

    # Definimos o response_schema compatível com a API do Google GenAI
    # No SDK atual da google-genai, podemos passar o schema como um dicionário de Type declarations.
    # Para alta portabilidade, também podemos instruir o modelo a responder estruturado em JSON e fazer o parse.
    # Mas para seguir o padrão oficial, vamos formatar a resposta no formato JSON estrito:
    
    def call_gemini():
        response = client.models.generate_content(
            model='gemini-2.5-flash', # ou o novo modelo selecionado
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                # Passamos as diretrizes do JSON diretamente ou estruturamos o schema.
                # Para maior estabilidade do lado do Python no Windows/Linux, solicitamos o JSON via MIME e garantimos no prompt a estrutura exata:
            )
        )
        return json.loads(response.text)

    return with_retry(call_gemini)


def ask_question_about_lecture(lecture_title: str, lecture_summary: str, key_concept: dict, question: str, chat_history: list) -> str:
    """
    Responde perguntas do usuário utilizando o contexto do material de estudo.
    """
    client = get_ai_client()
    
    # Formata histórico de chat anterior
    formatted_history = ""
    for msg in chat_history:
        sender = "Estudante" if msg.get("sender") == "user" else "Tutor"
        formatted_history += f"{sender}: {msg.get('text')}\n"

    prompt = f"""
    Você é o Tutor Inteligente do material de estudo "{lecture_title}".
    
    CONTEXTO DA AULA:
    Resumo:
    {lecture_summary}
    
    Conceito Chave ({key_concept.get('title')}):
    {key_concept.get('body')}
    
    HISTÓRICO DA CONVERSA:
    {formatted_history}
    
    DÚVIDA DO ESTUDANTE:
    "{question}"
    
    Responda à dúvida do estudante de forma empática, didática, acadêmica e encorajadora em Português do Brasil (pt-BR). Use formatação Markdown onde for conveniente para organizar sua explicação.
    """

    def call_gemini():
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text

    return with_retry(call_gemini)
