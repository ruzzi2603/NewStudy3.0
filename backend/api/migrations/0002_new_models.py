from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudyCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Nome da Categoria')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Descrição Curta')),
                ('icon', models.CharField(default='BookOpen', max_length=50, verbose_name='Ícone de Exibição (Lucide)')),
                ('is_active', models.BooleanField(default=True, verbose_name='Ativo no Painel')),
            ],
            options={
                'verbose_name': 'Disciplina / Categoria',
                'verbose_name_plural': '3. Categorias de Estudo',
            },
        ),
        migrations.CreateModel(
            name='SystemSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('config_name', models.CharField(default='Geral', max_length=100, unique=True, verbose_name='Identificador de Configuração')),
                ('api_model_target', models.CharField(default='gemini-2.5-flash', max_length=100, verbose_name='Model de IA Alvo (Gemini)')),
                ('temperature', models.FloatField(default=0.7, verbose_name='Criatividade (Temperature)')),
                ('max_tokens', models.IntegerField(default=4000, verbose_name='Limite Máximo de Tokens da Resposta')),
                ('is_maintenance', models.BooleanField(default=False, verbose_name='Ativar Modo Manutenção')),
            ],
            options={
                'verbose_name': 'Configurações do Sistema',
                'verbose_name_plural': '5. Configurações Globais',
            },
        ),
        migrations.CreateModel(
            name='StudentFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_email', models.CharField(max_length=150, verbose_name='E-mail do Aluno')),
                ('subject', models.CharField(max_length=200, verbose_name='Assunto')),
                ('message', models.TextField(verbose_name='Mensagem / Depoimento')),
                ('rating', models.IntegerField(choices=[(1, '★'), (2, '★★'), (3, '★★★'), (4, '★★★★'), (5, '★★★★★')], default=5, verbose_name='Avaliação do Sistema')),
                ('is_resolved', models.BooleanField(default=False, verbose_name='Resolvido / Lido')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Enviado em')),
            ],
            options={
                'verbose_name': 'Feedback de Aluno',
                'verbose_name_plural': '6. Feedbacks & Avaliações',
            },
        ),
        migrations.CreateModel(
            name='SystemAnnouncement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150, verbose_name='Título Principal')),
                ('subtitle', models.CharField(blank=True, null=True, max_length=250, verbose_name='Subtítulo Descritivo')),
                ('badge_text', models.CharField(default='NOVIDADE', max_length=50, verbose_name='Texto do Badge (Tag)')),
                ('accent_color', models.CharField(default='#8B5CF6', max_length=20, verbose_name='Cor de Destaque CSS')),
                ('is_visible', models.BooleanField(default=True, verbose_name='Visível para Alunos')),
                ('priority', models.IntegerField(default=1, verbose_name='Ordem de Exibição')),
            ],
            options={
                'verbose_name': 'Comunicado / Carrossel',
                'verbose_name_plural': '7. Informativos & Banners',
            },
        ),
        migrations.CreateModel(
            name='AcademicCoupon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50, unique=True, verbose_name='Código do Cupom')),
                ('discount_percent', models.IntegerField(default=10, verbose_name='Porcentagem de Desconto/Crédito')),
                ('expires_at', models.DateField(verbose_name='Data de Expiração')),
                ('max_uses', models.IntegerField(default=100, verbose_name='Uso Máximo Permitido')),
                ('times_used', models.IntegerField(default=0, verbose_name='Quantidade de Vezes Utilizado')),
            ],
            options={
                'verbose_name': 'Cupom Acadêmico',
                'verbose_name_plural': '8. Cupons de Desconto',
            },
        ),
        migrations.CreateModel(
            name='FAQItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=250, verbose_name='Pergunta Frequente')),
                ('answer', models.TextField(verbose_name='Resposta Detalhada')),
                ('order', models.IntegerField(default=0, verbose_name='Ordem de Relevância')),
            ],
            options={
                'verbose_name': 'Item de FAQ',
                'verbose_name_plural': '9. FAQ & Ajuda',
            },
        ),
        migrations.CreateModel(
            name='AIPromptTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task_name', models.CharField(max_length=100, unique=True, verbose_name='Nome da Tarefa (Ex: resumo_completo)')),
                ('system_instruction', models.TextField(verbose_name='Diretiva Primária do Prompt')),
                ('helper_notes', models.CharField(blank=True, null=True, max_length=200, verbose_name='Notas de Auxílio')),
            ],
            options={
                'verbose_name': 'Template de Prompt',
                'verbose_name_plural': '10. Engenharia de Prompts',
            },
        ),
        migrations.CreateModel(
            name='StudentStudySession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.CharField(max_length=100, verbose_name='ID do Aluno')),
                ('lecture_title', models.CharField(max_length=200, verbose_name='Título da Matéria')),
                ('study_type', models.CharField(choices=[('slides', 'Leitura de Slides'), ('quiz', 'Quiz Acadêmico'), ('flashcards', 'Revisão Espaçada')], max_length=50, verbose_name='Atividade Praticada')),
                ('duration_minutes', models.IntegerField(default=0, verbose_name='Duração (Minutos)')),
                ('date_recorded', models.DateTimeField(auto_now_add=True, verbose_name='Registrado em')),
            ],
            options={
                'verbose_name': 'Métrica de Estudo',
                'verbose_name_plural': '11. Métricas de Estudo',
            },
        ),
        migrations.CreateModel(
            name='FlashCardManual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('front', models.TextField(verbose_name='Frente (Pergunta/Conceito)')),
                ('back', models.TextField(verbose_name='Verso (Resposta Detalhada)')),
                ('difficulty_rating', models.IntegerField(choices=[(1, 'Muito Fácil'), (2, 'Fácil'), (3, 'Médio'), (4, 'Difícil'), (5, 'Extremo')], default=3, verbose_name='Dificuldade Sugerida')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Inserido em')),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.studycategory', verbose_name='Disciplina Relacionada')),
            ],
            options={
                'verbose_name': 'Flashcard Manual',
                'verbose_name_plural': '4. Flashcards de Professores',
            },
        ),
    ]
