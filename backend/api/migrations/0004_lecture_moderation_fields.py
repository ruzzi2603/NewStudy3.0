# Generated manually to keep Django admin aligned with the shared Supabase/Postgres database.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_flashcardmanual_is_active_user_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='lecture',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='Ativo'),
        ),
        migrations.AddField(
            model_name='lecture',
            name='moderation_note',
            field=models.TextField(blank=True, default='', verbose_name='Observacao de Moderacao'),
        ),
        migrations.AddField(
            model_name='lecture',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, verbose_name='Atualizado em'),
        ),
    ]
