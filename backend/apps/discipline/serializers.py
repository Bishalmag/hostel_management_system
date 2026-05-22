from rest_framework import serializers
from .models import Complaint, DisciplinaryAction

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['id', 'student', 'description', 'status', 'created_at']

class DisciplinaryActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DisciplinaryAction
        fields = ['id', 'complaint', 'action_taken', 'discipline_incharge', 'created_at']