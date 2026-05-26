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
]
