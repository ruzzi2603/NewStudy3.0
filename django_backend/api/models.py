from django.db import models

class User(models.Model):
    """
    Modelo de dados para Usuários, correspondente à tabela 'users' do banco Postgres.
    """
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f"{self.name} ({self.email})"


class Lecture(models.Model):
    """
    Modelo para os Módulos de Estudo, correspondente à tabela 'lectures'.
    Para flexibilidade, armazenamos o objeto inteiro mapeado pelo frontend no campo 'data' (JSON).
    """
    id = models.CharField(max_length=100, primary_key=True)
    user_id = models.CharField(max_length=100)
    data = models.JSONField() # Armazena o objeto Lecture completo (slides, flashcards, quizzes e chats)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lectures'
        verbose_name = 'Módulo de Estudo'
        verbose_name_plural = 'Módulos de Estudo'

    def __str__(self):
        try:
            return f"{self.data.get('title', 'Sem Título')} - ID: {self.id}"
        except Exception:
            return f"Módulo {self.id}"
