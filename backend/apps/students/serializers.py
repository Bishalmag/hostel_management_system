from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'user_email', 'user_name',
                  'preferred_floor', 'roommate_type',
                  'noise_tolerance', 'study_habits',
                  'assigned_room', 'created_at']