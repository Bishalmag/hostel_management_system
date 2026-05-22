from rest_framework import viewsets, permissions
from .models import Item, ProcurementPlan, SelectedItem
from .serializers import ItemSerializer, ProcurementPlanSerializer, SelectedItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category']

class ProcurementPlanViewSet(viewsets.ModelViewSet):
    queryset = ProcurementPlan.objects.all()
    serializer_class = ProcurementPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class SelectedItemViewSet(viewsets.ModelViewSet):
    queryset = SelectedItem.objects.select_related('item', 'procurement_plan').all()
    serializer_class = SelectedItemSerializer
    permission_classes = [permissions.IsAuthenticated]