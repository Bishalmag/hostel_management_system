# apps/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, 
    RegisterView, 
    MeView,
    ForgotPasswordView,
    VerifyOTPView,
    ResendOTPView,
    ResetPasswordView,
    ChangePasswordView
)

urlpatterns = [
    # Auth endpoints
    path('auth/login/',    LoginView.as_view(),        name='login'),
    path('auth/refresh/',  TokenRefreshView.as_view(), name='refresh'),
    path('auth/register/', RegisterView.as_view(),     name='register'),
    path('auth/me/',       MeView.as_view(),           name='me'),
    
    # Password reset endpoints
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/verify-otp/',      VerifyOTPView.as_view(),      name='verify-otp'),
    path('auth/resend-otp/',      ResendOTPView.as_view(),      name='resend-otp'),
    path('auth/reset-password/',  ResetPasswordView.as_view(),  name='reset-password'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
]