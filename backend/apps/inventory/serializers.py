from rest_framework import serializers
from .models import Item, ProcurementPlan, SelectedItem

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'category', 'cost', 'utility_value']

class SelectedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectedItem
        fields = ['id', 'procurement_plan', 'item', 'quantity']

class ProcurementPlanSerializer(serializers.ModelSerializer):
    items = SelectedItemSerializer(many=True, read_only=True, source='selecteditem_set')
    class Meta:
        model = ProcurementPlan
        fields = ['id', 'total_budget', 'remaining_budget', 'items', 'created_at']