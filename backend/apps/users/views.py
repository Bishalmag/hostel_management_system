# apps/users/views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
import random

# ✅ Import your custom User model from .models
from .models import User
from .serializers import UserSerializer, RegisterSerializer

# For OTP storage
otp_storage = {}
reset_token_storage = {}

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)

# ─── Forgot Password Endpoints ──────────────────────────────────────────

class ForgotPasswordView(APIView):
    """Send OTP to user's email"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'message': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'message': 'No user found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Store OTP with timestamp
        reset_token = get_random_string(length=32)
        otp_storage[reset_token] = {
            'user_id': user.id,
            'email': email,
            'otp': otp,
            'created_at': timezone.now(),
            'expires_at': timezone.now() + timedelta(minutes=5),
            'is_verified': False
        }
        
        # Print to console
        print(f"📧 OTP for {email}: {otp}")
        print(f"🔑 Reset Token: {reset_token}")
        
        return Response({
            'message': 'OTP sent successfully',
            'reset_token': reset_token,
            'otp': otp  # Remove in production
        }, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    """Verify OTP"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        reset_token = request.data.get('reset_token')
        otp = request.data.get('otp')
        
        if not reset_token or not otp:
            return Response(
                {'message': 'Reset token and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if reset_token not in otp_storage:
            return Response(
                {'message': 'Invalid or expired reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token_data = otp_storage[reset_token]
        
        if token_data['expires_at'] < timezone.now():
            del otp_storage[reset_token]
            return Response(
                {'message': 'OTP has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if token_data['otp'] != otp:
            return Response(
                {'message': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token_data['is_verified'] = True
        otp_storage[reset_token] = token_data
        
        return Response({
            'message': 'OTP verified successfully',
            'verified_token': reset_token
        }, status=status.HTTP_200_OK)

class ResendOTPView(APIView):
    """Resend OTP"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        reset_token = request.data.get('reset_token')
        email = request.data.get('email')
        
        if not reset_token and not email:
            return Response(
                {'message': 'Reset token or email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if reset_token and reset_token in otp_storage:
            token_data = otp_storage[reset_token]
            email = token_data['email']
        elif email:
            found_token = None
            for token, data in otp_storage.items():
                if data['email'] == email:
                    found_token = token
                    token_data = data
                    break
            if not found_token:
                return Response(
                    {'message': 'No reset request found for this email'},
                    status=status.HTTP_404_NOT_FOUND
                )
            reset_token = found_token
        else:
            return Response(
                {'message': 'Invalid request'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        token_data['otp'] = new_otp
        token_data['created_at'] = timezone.now()
        token_data['expires_at'] = timezone.now() + timedelta(minutes=5)
        token_data['is_verified'] = False
        otp_storage[reset_token] = token_data
        
        print(f"📧 New OTP for {email}: {new_otp}")
        
        return Response({
            'message': 'OTP resent successfully',
            'otp': new_otp
        }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    """Reset password with verified token"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        reset_token = request.data.get('reset_token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not reset_token or not new_password or not confirm_password:
            return Response(
                {'message': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'message': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'message': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if reset_token not in otp_storage:
            return Response(
                {'message': 'Invalid or expired reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token_data = otp_storage[reset_token]
        
        if not token_data.get('is_verified', False):
            return Response(
                {'message': 'OTP not verified. Please verify your OTP first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if token_data['expires_at'] < timezone.now():
            del otp_storage[reset_token]
            return Response(
                {'message': 'Session expired. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=token_data['user_id'])
            user.set_password(new_password)
            user.save()
            del otp_storage[reset_token]
            
            return Response({
                'message': 'Password reset successful'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class ChangePasswordView(APIView):
    """Change password for authenticated user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        user = request.user
        
        if not user.check_password(current_password):
            return Response(
                {'message': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'message': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'message': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if current_password == new_password:
            return Response(
                {'message': 'New password must be different from current password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)