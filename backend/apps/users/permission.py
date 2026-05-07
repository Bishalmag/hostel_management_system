from rest_framework.permissions import BasePermission

class IsHostelAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsWardenOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'warden']