from rest_framework import viewsets, permissions
from .models import Hostel, Block, Floor, Room
from .serializers import HostelSerializer, BlockSerializer, FloorSerializer, RoomSerializer

class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [permissions.IsAuthenticated]

class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.select_related('hostel').all()
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]

class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.select_related('block').all()
    serializer_class = FloorSerializer
    permission_classes = [permissions.IsAuthenticated]

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.select_related('floor').all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['room_type', 'floor']
    search_fields = ['room_number']