from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .algorithms.knapsack import knapsack_optimize
from .models import ProcurementItem, ProcurementSession
from .serializers import (
    OptimizeRequestSerializer,
    ProcurementItemSerializer,
    ProcurementSessionSerializer,
)


# ── Item Catalog ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def item_list(request):
    items = ProcurementItem.objects.filter(is_active=True)
    return Response(ProcurementItemSerializer(items, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def item_create(request):
    serializer = ProcurementItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def item_detail(request, pk):
    try:
        item = ProcurementItem.objects.get(pk=pk)
    except ProcurementItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)

    if request.method == 'GET':
        return Response(ProcurementItemSerializer(item).data)

    if request.method == 'PUT':
        serializer = ProcurementItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        item.is_active = False
        item.save()
        return Response({'message': f'"{item.name}" deactivated.'})


# ── Knapsack Optimization ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAdminUser])
def run_optimization(request):
    """
    POST { "budget": 50000 }
    Runs 0/1 Knapsack → saves session → returns result.
    """
    input_ser = OptimizeRequestSerializer(data=request.data)
    if not input_ser.is_valid():
        return Response(input_ser.errors, status=400)

    budget = float(input_ser.validated_data['budget'])

    items = list(
        ProcurementItem.objects.filter(is_active=True)
        .values('id', 'name', 'cost', 'utility_value', 'category')
    )
    if not items:
        return Response(
            {'error': 'No active items in catalog. Add items first.'},
            status=400
        )

    result = knapsack_optimize(items, budget)

    session = ProcurementSession.objects.create(
        created_by=request.user,
        total_budget=budget,
        status='optimized',
        optimized_at=timezone.now(),
        total_cost=result['total_cost'],
        total_utility=result['total_utility'],
        budget_remaining=result['budget_remaining'],
    )
    selected_items = ProcurementItem.objects.filter(
        id__in=result['selected_item_ids']
    )
    session.selected_items.set(selected_items)

    return Response({
        'session_id':       session.id,
        'budget':           budget,
        'total_cost':       result['total_cost'],
        'budget_remaining': result['budget_remaining'],
        'total_utility':    result['total_utility'],
        'items_considered': len(items),
        'items_selected':   len(result['selected_item_ids']),
        'dp_table_size':    result['dp_table_size'],
        'selected_items':   ProcurementItemSerializer(selected_items, many=True).data,
    })


# ── Session History ───────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def session_list(request):
    sessions = ProcurementSession.objects.all()
    return Response(ProcurementSessionSerializer(sessions, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def session_detail(request, pk):
    try:
        session = ProcurementSession.objects.get(pk=pk)
    except ProcurementSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)
    return Response(ProcurementSessionSerializer(session).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def mark_purchased(request, pk):
    try:
        session = ProcurementSession.objects.get(pk=pk)
    except ProcurementSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)
    session.status = 'purchased'
    session.save()
    return Response({'message': f'Session #{pk} marked as purchased.'})