from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name  = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model  = Student
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'middle_name', 'gender', 'phone',
            'guardian_name', 'guardian_relation', 'guardian_contact',
            'temp_address', 'temp_city', 'temp_state',
            'perm_address', 'perm_city', 'perm_state',
            'preferred_floor', 'assigned_room',
            'created_at',
        ]
