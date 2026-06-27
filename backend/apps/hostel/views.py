# views.py - Add these if missing
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.db.models import Sum

from .models import Hostel, Block, Floor, Room, LocationNode, NodeEdge
from .serializers import (HostelSerializer, BlockSerializer, FloorSerializer,
                           RoomSerializer, LocationNodeSerializer, NodeEdgeSerializer)
from .permissions import IsAdminUser
from .utils.dijkstra import build_graph, dijkstra


# ── existing viewsets ────────────────────

class HostelViewSet(viewsets.ModelViewSet):
    queryset           = Hostel.objects.all()
    serializer_class   = HostelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Hostel.objects.all()


class BlockViewSet(viewsets.ModelViewSet):
    queryset           = Block.objects.all()
    serializer_class   = BlockSerializer
    permission_classes = [IsAuthenticated]


class FloorViewSet(viewsets.ModelViewSet):
    queryset           = Floor.objects.all()
    serializer_class   = FloorSerializer
    permission_classes = [IsAuthenticated]


class RoomViewSet(viewsets.ModelViewSet):
    queryset         = Room.objects.all()
    serializer_class = RoomSerializer
    pagination_class = None 

    def get_permissions(self):
        if self.action in ['room_types_summary', 'available_rooms', 'dashboard_stats']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Room.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def available_rooms(self, request):
        """Only return residential rooms that are available for booking"""
        room_type     = request.query_params.get('room_type')
        ac_type       = request.query_params.get('ac_type')
        bathroom_type = request.query_params.get('bathroom_type')
        hostel_id     = request.query_params.get('hostel_id')
        
        queryset = Room.objects.filter(
            room_purpose='residential',
            current_occupancy__lt=models.F('capacity')
        )
        
        if room_type:     queryset = queryset.filter(room_type=room_type)
        if ac_type:       queryset = queryset.filter(ac_type=ac_type)
        if bathroom_type: queryset = queryset.filter(bathroom_type=bathroom_type)
        if hostel_id:     queryset = queryset.filter(floor__block__hostel_id=hostel_id)
        
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def room_types_summary(self, request):
        """Only show residential rooms in the summary"""
        hostel_id = request.query_params.get('hostel_id')
        queryset = Room.objects.filter(
            room_purpose='residential',
            current_occupancy__lt=models.F('capacity')
        )
        if hostel_id:
            queryset = queryset.filter(floor__block__hostel_id=hostel_id)
        
        summary = {}
        for room_type, type_label in Room.ROOM_TYPE_CHOICES:
            summary[room_type] = {'label': type_label, 'ac_types': {}}
            for ac_type, ac_label in Room.AC_CHOICES:
                summary[room_type]['ac_types'][ac_type] = {'label': ac_label, 'bathroom_types': {}}
                for bathroom_type, bathroom_label in Room.BATHROOM_CHOICES:
                    count = queryset.filter(room_type=room_type, ac_type=ac_type,
                                            bathroom_type=bathroom_type).count()
                    if count > 0:
                        room = queryset.filter(room_type=room_type, ac_type=ac_type,
                                               bathroom_type=bathroom_type).first()
                        summary[room_type]['ac_types'][ac_type]['bathroom_types'][bathroom_type] = {
                            'label': bathroom_label, 'available_count': count,
                            'price_per_month': float(room.price_per_month) if room and room.price_per_month else 0
                        }
        return Response(summary)
    
    @action(detail=True, methods=['post'])
    def increment_occupancy(self, request, pk=None):
        room = self.get_object()
        if room.current_occupancy >= room.capacity:
            return Response({'error': f'Room {room.room_number} is already full.'}, status=400)
        room.current_occupancy += 1
        room.save()
        return Response({'message': f'Occupancy increased for Room {room.room_number}',
                         'current_occupancy': room.current_occupancy,
                         'capacity': room.capacity,
                         'available_spots': room.capacity - room.current_occupancy})

    @action(detail=True, methods=['post'])
    def decrement_occupancy(self, request, pk=None):
        room = self.get_object()
        if room.current_occupancy > 0:
            room.current_occupancy -= 1
            room.save()
        return Response({'message': f'Occupancy decreased for Room {room.room_number}',
                         'current_occupancy': room.current_occupancy,
                         'capacity': room.capacity,
                         'available_spots': room.capacity - room.current_occupancy})

    @action(detail=True, methods=['get'])
    def availability_status(self, request, pk=None):
        room = self.get_object()
        return Response({
            'room_number': room.room_number,
            'capacity': room.capacity,
            'current_occupancy': room.current_occupancy,
            'available_spots': room.capacity - room.current_occupancy,
            'is_available': room.current_occupancy < room.capacity,
            'occupancy_percentage': (room.current_occupancy / room.capacity * 100) if room.capacity > 0 else 0
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def dashboard_stats(self, request):
        total_hostels = Hostel.objects.count()
        total_rooms   = Room.objects.count()
        from apps.students.models import Student
        total_students    = Student.objects.count()
        total_capacity    = Room.objects.aggregate(Sum('capacity'))['capacity__sum'] or 0
        total_occupied    = Room.objects.aggregate(Sum('current_occupancy'))['current_occupancy__sum'] or 0
        occupancy_pct     = (total_occupied / total_capacity * 100) if total_capacity > 0 else 0
        return Response({
            'hostels': total_hostels, 'rooms': total_rooms, 'students': total_students,
            'occupancy_percentage': round(occupancy_pct, 1),
            'total_capacity': total_capacity, 'total_occupied': total_occupied,
            'message': 'Dashboard stats fetched successfully'
        })


# ── Navigation viewsets ──────────────────────────

class LocationNodeViewSet(viewsets.ModelViewSet):
    """Admin: full CRUD. Student: list only via separate endpoint."""
    queryset           = LocationNode.objects.select_related('block', 'floor', 'room').all()
    serializer_class   = LocationNodeSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None 



class NodeEdgeViewSet(viewsets.ModelViewSet):
    queryset           = NodeEdge.objects.select_related('from_node', 'to_node').all()
    serializer_class   = NodeEdgeSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None 



# ── Student-safe endpoints ───────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nodes_list_public(request):
    """Return id + name + node_type only. Students use this for dropdowns."""
    nodes = LocationNode.objects.values('id', 'name', 'node_type')
    return Response(list(nodes))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def find_path_view(request):
    """
    GET /api/hostel/navigate/?from=<id>&to=<id>
    Returns shortest path + human-readable names + block/floor info.
    """
    from_id = request.query_params.get('from')
    to_id = request.query_params.get('to')

    if not from_id or not to_id:
        return Response({"error": "Both 'from' and 'to' node IDs required."}, status=400)

    try:
        from_id, to_id = int(from_id), int(to_id)
    except ValueError:
        return Response({"error": "IDs must be integers."}, status=400)

    if from_id == to_id:
        node = LocationNode.objects.filter(id=from_id).first()
        name = node.name if node else str(from_id)
        return Response({
            "path": [from_id], 
            "path_names": [name],
            "total_cost": 0, 
            "found": True,
            "steps": [{"from": from_id, "to": from_id, "description": "You are already here!", "weight": 0}]
        })

    graph = build_graph(NodeEdge.objects.all())
    result = dijkstra(graph, from_id, to_id)

    if not result['found']:
        return Response({"error": "No path found. The locations may not be connected yet."}, status=404)

    # Get detailed node information
    node_details = {}
    for node in LocationNode.objects.filter(id__in=result['path']).select_related('block', 'floor'):
        node_details[node.id] = {
            'name': node.name,
            'block_id': node.block_id,
            'block_name': node.block.name if node.block else None,
            'floor_number': node.floor.floor_number if node.floor else None,
            'node_type': node.node_type,
            'room_number': node.room.room_number if node.room else None,
            'room_purpose': node.room.room_purpose if node.room else None,
        }

    result['path_names'] = [node_details.get(nid, {}).get('name', str(nid)) for nid in result['path']]
    result['node_details'] = node_details
    
    # Add detailed step information
    for step in result['steps']:
        from_node = LocationNode.objects.filter(id=step['from']).first()
        to_node = LocationNode.objects.filter(id=step['to']).first()
        
        if from_node:
            step['from_block'] = from_node.block.name if from_node.block else None
            step['from_floor'] = from_node.floor.floor_number if from_node.floor else None
            step['from_room'] = from_node.room.room_number if from_node.room else None
            step['from_purpose'] = from_node.room.room_purpose if from_node.room else None
            
        if to_node:
            step['to_block'] = to_node.block.name if to_node.block else None
            step['to_floor'] = to_node.floor.floor_number if to_node.floor else None
            step['to_room'] = to_node.room.room_number if to_node.room else None
            step['to_purpose'] = to_node.room.room_purpose if to_node.room else None
        
        # Check if moving between different blocks
        if from_node and to_node and from_node.block and to_node.block:
            step['block_change'] = from_node.block.id != to_node.block.id
            if step['block_change']:
                step['block_change_info'] = f"{from_node.block.name} → {to_node.block.name}"
        else:
            step['block_change'] = False
        
        # Check if it's a staircase
        if (from_node and to_node and 
            from_node.floor and to_node.floor and
            from_node.floor.block_id == to_node.floor.block_id and
            from_node.floor.id != to_node.floor.id):
            step['is_staircase'] = True
            step['floor_change'] = to_node.floor.floor_number - from_node.floor.floor_number
            step['floor_change_direction'] = 'up' if step['floor_change'] > 0 else 'down'
        else:
            step['is_staircase'] = False
        
        # Check if moving between different floors
        if from_node and to_node and from_node.floor and to_node.floor:
            step['floor_change'] = to_node.floor.floor_number - from_node.floor.floor_number
        else:
            step['floor_change'] = 0

    return Response(result)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nearest_reception_view(request):
    """
    GET /api/hostel/nearest-reception/?from=<node_id>
    Find the nearest reception from a given node
    """
    from_node_id = request.query_params.get('from')
    
    if not from_node_id:
        return Response({"error": "'from' node ID required."}, status=400)
    
    try:
        from_node_id = int(from_node_id)
    except ValueError:
        return Response({"error": "ID must be integer."}, status=400)
    
    # Get all reception nodes
    reception_nodes = LocationNode.objects.filter(
        node_type='room',
        room__room_purpose='reception'
    ).values_list('id', flat=True)
    
    if not reception_nodes:
        return Response({"error": "No reception found in the system."}, status=404)
    
    graph = build_graph(NodeEdge.objects.all())
    best_path = None
    best_distance = float('inf')
    
    for to_node_id in reception_nodes:
        if from_node_id == to_node_id:
            continue
        result = dijkstra(graph, from_node_id, to_node_id)
        if result['found'] and result['total_cost'] < best_distance:
            best_distance = result['total_cost']
            best_path = result
    
    if not best_path:
        return Response({"error": "No path to any reception found."}, status=404)
    
    # Add human-readable names
    node_map = {n.id: n.name for n in LocationNode.objects.filter(id__in=best_path['path'])}
    best_path['path_names'] = [node_map.get(nid, str(nid)) for nid in best_path['path']]
    
    return Response(best_path)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nodes_by_purpose_view(request):
    """
    GET /api/hostel/nodes-by-purpose/?purpose=reception
    Returns all location nodes filtered by room purpose
    """
    purpose = request.query_params.get('purpose')
    
    if not purpose:
        return Response({"error": "Purpose parameter required."}, status=400)
    
    nodes = LocationNode.objects.filter(
        node_type='room',
        room__room_purpose=purpose
    ).values('id', 'name', 'node_type', 'room__room_number')
    
    return Response(list(nodes))


@api_view(['GET'])
@permission_classes([AllowAny])
def available_rooms_view(request):
    """
    GET /api/hostel/available-rooms/
    Returns all available residential rooms for students
    """
    hostel_id = request.query_params.get('hostel_id')
    room_type = request.query_params.get('room_type')
    
    queryset = Room.objects.filter(
        room_purpose='residential',
        current_occupancy__lt=models.F('capacity')
    )
    
    if hostel_id:
        queryset = queryset.filter(floor__block__hostel_id=hostel_id)
    if room_type:
        queryset = queryset.filter(room_type=room_type)
    
    serializer = RoomSerializer(queryset, many=True)
    return Response(serializer.data)