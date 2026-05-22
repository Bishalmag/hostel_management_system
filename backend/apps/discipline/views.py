from rest_framework import viewsets, permissions
from .models import Complaint, DisciplinaryAction
from .serializers import ComplaintSerializer, DisciplinaryActionSerializer

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']

class DisciplinaryActionViewSet(viewsets.ModelViewSet):
    queryset = DisciplinaryAction.objects.select_related('complaint').all()
    serializer_class = DisciplinaryActionSerializer
    permission_classes = [permissions.IsAuthenticated]