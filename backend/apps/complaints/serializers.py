from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):

    # 👤 show username instead of just ID (read-only)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'user',
            'user_name',
            'title',
            'description',
            'status',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'created_at',
            'updated_at',
            'user',
        ]