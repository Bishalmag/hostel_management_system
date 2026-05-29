from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Complaint
from .serializers import ComplaintSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # 👤 students see only their complaints
        if user.is_staff:
            return Complaint.objects.all()

        return Complaint.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)