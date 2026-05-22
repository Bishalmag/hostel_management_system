from rest_framework import serializers
from .models import Allocation, RoomPreference, StudentPreference, MatchingResult

class AllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allocation
        fields = ['id', 'student', 'room', 'allocated_on',
                  'valid_until', 'status', 'allocated_by']

class RoomPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomPreference
        fields = ['id', 'room', 'attributes']

class StudentPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentPreference
        fields = ['id', 'student', 'preferences']

class MatchingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingResult
        fields = ['id', 'student', 'room', 'allocation_date']