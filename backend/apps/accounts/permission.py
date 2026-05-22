from rest_framework.permissions import BasePermission
from .models import User

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_super_admin()

class IsHostelAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_hostel_admin()

class IsDisciplineIncharge(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_discipline_incharge()

class IsWarden(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_warden()

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student()

class IsAdminOrWarden(BasePermission):
    """Hostel Admin OR Warden — common combo"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_hostel_admin() or request.user.is_warden()
        )