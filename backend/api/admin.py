from django.contrib import admin
from .models import (
    User,
    Lecture,
    StudyCategory,
    FlashCardManual,
    SystemSettings,
    StudentFeedback,
    SystemAnnouncement,
    AcademicCoupon,
    FAQItem,
    AIPromptTemplate,
    StudentStudySession,
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at', 'id')
    search_fields = ('name', 'email', 'id')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('get_title', 'user_id', 'created_at', 'id')
    search_fields = ('id', 'user_id')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

    def get_title(self, obj):
        try:
            return obj.data.get('title', 'Sem Título')
        except Exception:
            return "Módulo sem Título"
    get_title.short_description = "Título do Material"


@admin.register(StudyCategory)
class StudyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'is_active')
    search_fields = ('name', 'description')
    list_filter = ('is_active',)
    ordering = ('name',)


@admin.register(FlashCardManual)
class FlashCardManualAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'get_short_front', 'difficulty_rating', 'created_at')
    list_filter = ('difficulty_rating', 'category', 'created_at')
    search_fields = ('front', 'back')
    ordering = ('-created_at',)

    def get_short_front(self, obj):
        return obj.front[:60] + "..." if len(obj.front) > 60 else obj.front
    get_short_front.short_description = "Frente (Conceito)"


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('config_name', 'api_model_target', 'temperature', 'max_tokens', 'is_maintenance')
    search_fields = ('config_name', 'api_model_target')
    list_filter = ('is_maintenance',)


@admin.register(StudentFeedback)
class StudentFeedbackAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user_email', 'rating', 'is_resolved', 'created_at')
    list_filter = ('rating', 'is_resolved', 'created_at')
    search_fields = ('user_email', 'subject', 'message')
    ordering = ('-created_at',)


@admin.register(SystemAnnouncement)
class SystemAnnouncementAdmin(admin.ModelAdmin):
    list_display = ('priority', 'title', 'badge_text', 'is_visible', 'accent_color')
    list_filter = ('is_visible',)
    search_fields = ('title', 'subtitle', 'badge_text')
    ordering = ('priority',)


@admin.register(AcademicCoupon)
class AcademicCouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'expires_at', 'times_used', 'max_uses')
    search_fields = ('code',)
    list_filter = ('expires_at',)
    ordering = ('code',)


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'question')
    search_fields = ('question', 'answer')
    ordering = ('order',)


@admin.register(AIPromptTemplate)
class AIPromptTemplateAdmin(admin.ModelAdmin):
    list_display = ('task_name', 'helper_notes')
    search_fields = ('task_name', 'system_instruction')
    ordering = ('task_name',)


@admin.register(StudentStudySession)
class StudentStudySessionAdmin(admin.ModelAdmin):
    list_display = ('lecture_title', 'user_id', 'study_type', 'duration_minutes', 'date_recorded')
    list_filter = ('study_type', 'date_recorded')
    search_fields = ('user_id', 'lecture_title')
    ordering = ('-date_recorded',)
