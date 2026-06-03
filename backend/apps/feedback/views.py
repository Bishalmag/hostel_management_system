from rest_framework import viewsets, permissions
from .models import Feedback
from .serializers import FeedbackSerializer


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Feedback.objects.all()
        return Feedback.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
