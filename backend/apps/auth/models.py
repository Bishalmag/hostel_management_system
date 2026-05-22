from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom User Model with Roles"""
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
        ('student', 'Student'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def has_permission(self, permission):
        """Check if user has specific permission based on role"""
        role_permissions = {
            'admin': ['read', 'write', 'delete', 'manage_users', 'view_reports'],
            'manager': ['read', 'write', 'view_reports'],
            'staff': ['read', 'write'],
            'student': ['read'],
        }
        return permission in role_permissions.get(self.role, [])