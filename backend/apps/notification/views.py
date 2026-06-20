from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from apps.users.models import User

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(receiver=self.request.user)
    
    @action(detail=False, methods=['post'])
    def send_announcement(self, request):
        """Send announcement to all students"""
        # Check if user is admin/staff
        if not request.user.is_staff:
            return Response(
                {'error': 'Only admins can send announcements'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('notification_type', 'announcement')
        priority = request.data.get('priority', 'medium')
        expires_at = request.data.get('expires_at')
        link = request.data.get('link')
        
        if not title or not message:
            return Response(
                {'error': 'Title and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all students
        students = User.objects.filter(role__name='Student')
        
        # Create notification for each student
        notifications = []
        for student in students:
            notification = Notification.objects.create(
                receiver=student,
                sender=request.user,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                link=link,
                expires_at=expires_at,
                read_status=False
            )
            notifications.append(notification.id)
        
        return Response({
            'message': f'Announcement sent to {len(notifications)} students',
            'notification_ids': notifications,
            'count': len(notifications)
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        count = Notification.objects.filter(
            receiver=request.user,
            read_status=False
        ).update(read_status=True)
        
        return Response({
            'message': f'Marked {count} notifications as read',
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        count = Notification.objects.filter(
            receiver=request.user,
            read_status=False
        ).count()
        
        return Response({'count': count})
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get urgent notifications"""
        from django.utils import timezone
        notifications = Notification.objects.filter(
            receiver=request.user,
            read_status=False,
            priority='urgent'
        ).filter(
            models.Q(expires_at__gte=timezone.now()) | models.Q(expires_at__isnull=True)
        )
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)