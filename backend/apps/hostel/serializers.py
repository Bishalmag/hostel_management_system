from rest_framework import serializers
from .models import Hostel, Block, Floor, Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'floor', 'room_number', 'capacity',
                  'current_occupancy', 'room_type', 'facilities']

class FloorSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    class Meta:
        model = Floor
        fields = ['id', 'block', 'floor_number', 'rooms']

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ['id', 'hostel', 'name']

class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'address', 'created_at']