from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'receiver', 'sender', 'sender_name', 'message', 
            'read_status', 'notification_type', 'priority', 'title',
            'link', 'expires_at', 'created_at', 'updated_at',
            'is_expired', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_expired', 'is_active']