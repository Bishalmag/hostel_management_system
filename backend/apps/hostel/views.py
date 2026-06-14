# apps/hostel/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from .models import Hostel, Block, Floor, Room
from .serializers import HostelSerializer, BlockSerializer, FloorSerializer, RoomSerializer


class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Hostel.objects.all()


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [IsAuthenticated]


class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
    def get_permissions(self):
        """Allow public access to room summary and available rooms endpoints"""
        if self.action in ['room_types_summary', 'available_rooms']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        return Room.objects.all()
    
    @action(detail=True, methods=['post'])
    def increment_occupancy(self, request, pk=None):
        """Increment room occupancy (when booking is approved)"""
        room = self.get_object()
        
        if room.current_occupancy >= room.capacity:
            return Response({
                'error': f'Room {room.room_number} is already full. Capacity: {room.capacity}/{room.current_occupancy}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        room.current_occupancy += 1
        room.save()
        
        return Response({
            'message': f'Occupancy increased for Room {room.room_number}',
            'current_occupancy': room.current_occupancy,
            'capacity': room.capacity,
            'available_spots': room.capacity - room.current_occupancy
        })
    
    @action(detail=True, methods=['post'])
    def decrement_occupancy(self, request, pk=None):
        """Decrement room occupancy (when booking is cancelled/rejected)"""
        room = self.get_object()
        
        if room.current_occupancy > 0:
            room.current_occupancy -= 1
            room.save()
        
        return Response({
            'message': f'Occupancy decreased for Room {room.room_number}',
            'current_occupancy': room.current_occupancy,
            'capacity': room.capacity,
            'available_spots': room.capacity - room.current_occupancy
        })
    
    @action(detail=True, methods=['get'])
    def availability_status(self, request, pk=None):
        """Get detailed availability status of a room"""
        room = self.get_object()
        
        return Response({
            'room_number': room.room_number,
            'capacity': room.capacity,
            'current_occupancy': room.current_occupancy,
            'available_spots': room.capacity - room.current_occupancy,
            'is_available': room.current_occupancy < room.capacity,
            'occupancy_percentage': (room.current_occupancy / room.capacity) * 100 if room.capacity > 0 else 0
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def available_rooms(self, request):
        """Get available rooms filtered by type, AC, bathroom - Public access"""
        room_type = request.query_params.get('room_type')
        ac_type = request.query_params.get('ac_type')
        bathroom_type = request.query_params.get('bathroom_type')
        hostel_id = request.query_params.get('hostel_id')
        
        queryset = Room.objects.filter(current_occupancy__lt=models.F('capacity'))
        
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        if ac_type:
            queryset = queryset.filter(ac_type=ac_type)
        if bathroom_type:
            queryset = queryset.filter(bathroom_type=bathroom_type)
        if hostel_id:
            queryset = queryset.filter(floor__block__hostel_id=hostel_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def room_types_summary(self, request):
        """Get summary of available rooms by type, AC, bathroom - Public access"""
        hostel_id = request.query_params.get('hostel_id')
        
        queryset = Room.objects.filter(current_occupancy__lt=models.F('capacity'))
        if hostel_id:
            queryset = queryset.filter(floor__block__hostel_id=hostel_id)
        
        summary = {}
        for room_type, type_label in Room.ROOM_TYPE_CHOICES:
            summary[room_type] = {
                'label': type_label,
                'ac_types': {}
            }
            for ac_type, ac_label in Room.AC_CHOICES:
                summary[room_type]['ac_types'][ac_type] = {
                    'label': ac_label,
                    'bathroom_types': {}
                }
                for bathroom_type, bathroom_label in Room.BATHROOM_CHOICES:
                    count = queryset.filter(
                        room_type=room_type, 
                        ac_type=ac_type, 
                        bathroom_type=bathroom_type
                    ).count()
                    
                    if count > 0:
                        room = queryset.filter(
                            room_type=room_type, 
                            ac_type=ac_type, 
                            bathroom_type=bathroom_type
                        ).first()
                        
                        summary[room_type]['ac_types'][ac_type]['bathroom_types'][bathroom_type] = {
                            'label': bathroom_label,
                            'available_count': count,
                            'price_per_month': float(room.price_per_month) if room and room.price_per_month else 0
                        }
        
        return Response(summary)