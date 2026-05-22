from rest_framework import viewsets, permissions
from .models import Student
from .serializers import StudentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user', 'assigned_room').all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['user__full_name', 'user__email']
    ordering_fields = ['created_at']