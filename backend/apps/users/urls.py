from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, RegisterView, MeView

urlpatterns = [
    path('auth/login/',    LoginView.as_view(),        name='login'),
    path('auth/refresh/',  TokenRefreshView.as_view(), name='refresh'),
    path('auth/register/', RegisterView.as_view(),     name='register'),
    path('auth/me/',       MeView.as_view(),           name='me'),
]