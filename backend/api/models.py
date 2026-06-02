from django.db import models

class User(models.Model):
    """
    1. Modelo de dados para Alunos (Estudantes), correspondente à tabela 'users' do banco Postgres.
    """
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100, verbose_name="Nome Completo")
    email = models.EmailField(max_length=150, unique=True, verbose_name="E-mail Acadêmico")
    password_hash = models.TextField(verbose_name="Senha Hash")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Cadastrado em")
    is_active = models.BooleanField(default=True, verbose_name="Ativo: ")

    class Meta:
        db_table = 'users'
        verbose_name = 'Alunos (Estudante)'
        verbose_name_plural = '1. Cadastro de Alunos'

    def __str__(self):
        return f"{self.name} ({self.email})"


class Lecture(models.Model):
    """
    2. Modelo para os Módulos de Estudo, correspondente à tabela 'lectures'.
    """
    id = models.CharField(max_length=100, primary_key=True)
    user_id = models.CharField(max_length=100, verbose_name="ID do Aluno")
    data = models.JSONField(verbose_name="Conteúdo de Estudo (JSON)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Sintetizado em")

    class Meta:
        db_table = 'lectures'
        verbose_name = 'Módulo de Estudo'
        verbose_name_plural = '2. Módulos de Estudo (AI)'

    def __str__(self):
        try:
            return f"{self.data.get('title', 'Sem Título')} - ID: {self.id}"
        except Exception:
            return f"Módulo {self.id}"


class StudyCategory(models.Model):
    """
    3. Categorias ou Categorizações Temáticas de Estudo (ex: Física, Medicina, Programação).
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição Curta")
    icon = models.CharField(max_length=50, default="BookOpen", verbose_name="Ícone de Exibição (Lucide)")
    is_active = models.BooleanField(default=True, verbose_name="Ativo no Painel")

    class Meta:
        verbose_name = 'Disciplina / Categoria'
        verbose_name_plural = '3. Categorias de Estudo'

    def __str__(self):
        return self.name


class FlashCardManual(models.Model):
    """
    4. Flashcards individuais inseridos ou moderados em lote pela equipe de professores ou administração do sistema.
    """
    category = models.ForeignKey(StudyCategory, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Disciplina Relacionada")
    front = models.TextField(verbose_name="Frente (Pergunta/Conceito)")
    back = models.TextField(verbose_name="Verso (Resposta Detalhada)")
    difficulty_rating = models.IntegerField(default=3, choices=[(1, 'Muito Fácil'), (2, 'Fácil'), (3, 'Médio'), (4, 'Difícil'), (5, 'Extremo')], verbose_name="Dificuldade Sugerida")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Inserido em")
    is_active = models.BooleanField(default=True, verbose_name="Ativo: ")

    class Meta:
        verbose_name = 'Flashcard Manual'
        verbose_name_plural = '4. Flashcards de Professores'

    def __str__(self):
        return f"FC #{self.id}: {self.front[:40]}..."


class SystemSettings(models.Model):
    """
    5. Parâmetros dinâmicos do sistema NewStudy para o administrador gerenciar sem alterar código backend.
    """
    config_name = models.CharField(max_length=100, unique=True, default="Geral", verbose_name="Identificador de Configuração")
    api_model_target = models.CharField(max_length=100, default="gemini-2.5-flash", verbose_name="Model de IA Alvo (Gemini)")
    temperature = models.FloatField(default=0.7, verbose_name="Criatividade (Temperature)")
    max_tokens = models.IntegerField(default=4000, verbose_name="Limite Máximo de Tokens da Resposta")
    is_maintenance = models.BooleanField(default=False, verbose_name="Ativar Modo Manutenção")

    class Meta:
        verbose_name = 'Configurações do Sistema'
        verbose_name_plural = '5. Configurações Globais'

    def __str__(self):
        return f"Config '{self.config_name}' (IA: {self.api_model_target})"


class StudentFeedback(models.Model):
    """
    6. Canal direto de sugestões, denúncias ou feedback geral enviado pelos alunos.
    """
    user_email = models.CharField(max_length=150, verbose_name="E-mail do Aluno")
    subject = models.CharField(max_length=200, verbose_name="Assunto")
    message = models.TextField(verbose_name="Mensagem / Depoimento")
    rating = models.IntegerField(default=5, choices=[(1, '★'), (2, '★★'), (3, '★★★'), (4, '★★★★'), (5, '★★★★★')], verbose_name="Avaliação do Sistema")
    is_resolved = models.BooleanField(default=False, verbose_name="Resolvido / Lido")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Enviado em")

    class Meta:
        verbose_name = 'Feedback de Aluno'
        verbose_name_plural = '6. Feedbacks & Avaliações'

    def __str__(self):
        status_txt = "Resolvido" if self.is_resolved else "Pendente"
        return f"[{status_txt}] {self.subject} ({self.user_email})"


class SystemAnnouncement(models.Model):
    """
    7. Painel de Promoções, Novidades e Tutorias (slides exibidos no carrossel superior do painel estudantil).
    """
    title = models.CharField(max_length=150, verbose_name="Título Principal")
    subtitle = models.CharField(max_length=250, blank=True, null=True, verbose_name="Subtítulo Descritivo")
    badge_text = models.CharField(max_length=50, default="NOVIDADE", verbose_name="Texto do Badge (Tag)")
    accent_color = models.CharField(max_length=20, default="#8B5CF6", verbose_name="Cor de Destaque CSS")
    is_visible = models.BooleanField(default=True, verbose_name="Visível para Alunos")
    priority = models.IntegerField(default=1, verbose_name="Ordem de Exibição")

    class Meta:
        verbose_name = 'Comunicado / Carrossel'
        verbose_name_plural = '7. Informativos & Banners'

    def __str__(self):
        return f"{self.priority}° - {self.title}"


class AcademicCoupon(models.Model):
    """
    8. Cupons e Vouchers para simular resgate acadêmico de planos Premium na plataforma.
    """
    code = models.CharField(max_length=50, unique=True, verbose_name="Código do Cupom")
    discount_percent = models.IntegerField(default=10, verbose_name="Porcentagem de Desconto/Crédito")
    expires_at = models.DateField(verbose_name="Data de Expiração")
    max_uses = models.IntegerField(default=100, verbose_name="Uso Máximo Permitido")
    times_used = models.IntegerField(default=0, verbose_name="Quantidade de Vezes Utilizado")

    class Meta:
        verbose_name = 'Cupom Acadêmico'
        verbose_name_plural = '8. Cupons de Desconto'

    def __str__(self):
        return f"Cupom {self.code} ({self.discount_percent}% de benefício)"


class FAQItem(models.Model):
    """
    9. Itens da Central de Suporte e Primeiros Passos do Estudante.
    """
    question = models.CharField(max_length=250, verbose_name="Pergunta Frequente")
    answer = models.TextField(verbose_name="Resposta Detalhada")
    order = models.IntegerField(default=0, verbose_name="Ordem de Relevância")

    class Meta:
        verbose_name = 'Item de FAQ'
        verbose_name_plural = '9. FAQ & Ajuda'

    def __str__(self):
        return f"FAQ: {self.question[:50]}..."


class AIPromptTemplate(models.Model):
    """
    10. Engenharia de instruções customizada que orienta a síntese de slides, quizzes e resumos.
    """
    task_name = models.CharField(max_length=100, unique=True, verbose_name="Nome da Tarefa (Ex: resumo_completo)")
    system_instruction = models.TextField(verbose_name="Diretiva Primária do Prompt")
    helper_notes = models.CharField(max_length=200, blank=True, null=True, verbose_name="Notas de Auxílio")

    class Meta:
        verbose_name = 'Template de Prompt'
        verbose_name_plural = '10. Engenharia de Prompts'

    def __str__(self):
        return f"Prompt: {self.task_name}"


class StudentStudySession(models.Model):
    """
    11. Histórico analítico e métricas das sessões de revisão feitas pelos alunos.
    """
    user_id = models.CharField(max_length=100, verbose_name="ID do Aluno")
    lecture_title = models.CharField(max_length=200, verbose_name="Título da Matéria")
    study_type = models.CharField(max_length=50, choices=[('slides', 'Leitura de Slides'), ('quiz', 'Quiz Acadêmico'), ('flashcards', 'Revisão Espaçada')], verbose_name="Atividade Praticada")
    duration_minutes = models.IntegerField(default=0, verbose_name="Duração (Minutos)")
    date_recorded = models.DateTimeField(auto_now_add=True, verbose_name="Registrado em")

    class Meta:
        verbose_name = 'Métrica de Estudo'
        verbose_name_plural = '11. Métricas de Estudo'

    def __str__(self):
        return f"Sessão de {self.study_type} - {self.lecture_title}"
