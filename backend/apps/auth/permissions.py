from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsManager(BasePermission):
    """Allow access to managers and admins"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager'])


class IsStaff(BasePermission):
    """Allow access to staff, managers, and admins"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'manager', 'staff'])


class IsStudent(BasePermission):
    """Allow access to students and above"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class HasPermission(BasePermission):
    """Check if user has specific permission based on role"""
    
    required_permission = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not self.required_permission:
            return True
        
        return request.user.has_permission(self.required_permission)