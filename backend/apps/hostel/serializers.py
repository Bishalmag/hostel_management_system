from rest_framework import serializers
from .models import Hostel, Block, Floor, Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Room
        fields = ['id', 'floor', 'room_number', 'capacity',
                  'current_occupancy', 'room_type', 'facilities']



class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Block
        fields = ['id', 'hostel', 'name']

class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Hostel
        fields = ['id', 'name', 'address', 'created_at']

class FloorSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    
    block = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all()
    )
    block_name = serializers.CharField(read_only=True, source='block.name')
    hostel_name = serializers.CharField(read_only=True, source='block.hostel.name')
    class Meta:
        model  = Floor
        fields = ['id', 'block', 'hostel_name', 'block_name', 'floor_number', 'rooms', ]
