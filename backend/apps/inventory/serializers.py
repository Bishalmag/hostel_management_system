from rest_framework import serializers
from .models import ProcurementItem, ProcurementSession


class ProcurementItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProcurementItem
        fields = [
            'id', 'name', 'category', 'cost',
            'utility_value', 'description', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProcurementSessionSerializer(serializers.ModelSerializer):
    selected_items = ProcurementItemSerializer(many=True, read_only=True)
    created_by     = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = ProcurementSession
        fields = [
            'id', 'created_by', 'total_budget', 'status',
            'created_at', 'optimized_at', 'selected_items',
            'total_cost', 'total_utility', 'budget_remaining',
        ]
        read_only_fields = [
            'created_by', 'status', 'created_at', 'optimized_at',
            'selected_items', 'total_cost', 'total_utility', 'budget_remaining',
        ]


class OptimizeRequestSerializer(serializers.Serializer):
    budget = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=1
    )
    selected_item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        allow_empty=False,
        help_text="List of item IDs to consider for procurement"
    )