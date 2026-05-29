from django.urls import path
from . import views

urlpatterns = [
    # Rotas de Autenticação
    path('auth/me', views.auth_me, name='auth_me'),
    path('auth/register', views.auth_register, name='auth_register'),
    path('auth/login', views.auth_login, name='auth_login'),
    path('auth/logout', views.auth_logout, name='auth_logout'),
    
    # Rotas do App / Estudo
    path('usage/statistics', views.usage_statistics, name='usage_statistics'),
    path('lectures', views.lecture_list_create, name='lectures_list_create'),
    path('lectures/<str:pk>', views.lecture_detail_delete, name='lectures_detail_delete'),
    path('lectures/<str:pk>/flashcards/review', views.flashcard_review, name='flashcard_review'),
    path('lectures/<str:pk>/ask', views.ask_question, name='ask_question'),
    
    # Novas Rotas Adicionadas (11 Novas Funcionalidades de Apoio aoEstudante)
    path('lectures/<str:pk>/slides/note', views.add_custom_slide_note, name='add_custom_slide_note'),
    path('lectures/<str:pk>/progress', views.update_study_progress, name='update_study_progress'),
    path('lectures/<str:pk>/favorite', views.toggle_favorite, name='toggle_favorite'),
    path('lectures/<str:pk>/quiz/score', views.register_quiz_score, name='register_quiz_score'),
    path('lectures/<str:pk>/reset', views.reset_study_data, name='reset_study_data'),
    path('lectures/<str:pk>/export/markdown', views.export_lecture_markdown, name='export_lecture_markdown'),
    path('lectures/<str:pk>/flashcards/add', views.add_custom_flashcard, name='add_custom_flashcard'),
    path('lectures/<str:pk>/flashcards/delete', views.delete_flashcard, name='delete_flashcard'),
    path('lectures/<str:pk>/collection', views.assign_collection_folder, name='assign_collection_folder'),
    path('lectures/<str:pk>/rename', views.rename_lecture, name='rename_lecture'),
    path('users/settings', views.update_user_settings, name='update_user_settings'),
    path('announcements/', views.list_announcements, name='list_announcements'),
]
