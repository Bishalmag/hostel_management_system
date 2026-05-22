from rest_framework import viewsets, permissions
from .models import Allocation, RoomPreference, StudentPreference, MatchingResult
from .serializers import (AllocationSerializer, RoomPreferenceSerializer,
                           StudentPreferenceSerializer, MatchingResultSerializer)

class AllocationViewSet(viewsets.ModelViewSet):
    queryset = Allocation.objects.select_related('student', 'room').all()
    serializer_class = AllocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']

class RoomPreferenceViewSet(viewsets.ModelViewSet):
    queryset = RoomPreference.objects.all()
    serializer_class = RoomPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

class StudentPreferenceViewSet(viewsets.ModelViewSet):
    queryset = StudentPreference.objects.all()
    serializer_class = StudentPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

class MatchingResultViewSet(viewsets.ModelViewSet):
    queryset = MatchingResult.objects.all()
    serializer_class = MatchingResultSerializer
    permission_classes = [permissions.IsAuthenticated]