from rest_framework import serializers
from .models import Hostel, Block, Floor, Room


# ---------------- HOSTEL ----------------
class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'address']


# ---------------- BLOCK ----------------
class BlockSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)

    class Meta:
        model = Block
        fields = ['id', 'hostel', 'hostel_name', 'name']


# ---------------- FLOOR ----------------
class FloorSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    hostel = serializers.IntegerField(source='block.hostel.id', read_only=True)

    class Meta:
        model = Floor
        fields = [
            'id',
            'block',
            'block_name',
            'hostel',
            'floor_number'
        ]


# ---------------- ROOM ----------------
class RoomSerializer(serializers.ModelSerializer):
    block = serializers.IntegerField(source='floor.block.id', read_only=True)
    hostel = serializers.IntegerField(source='floor.block.hostel.id', read_only=True)
    floor_number = serializers.IntegerField(source='floor.floor_number', read_only=True)

    class Meta:
        model = Room
        fields = [
            'id',
            'hostel',
            'block',
            'floor',
            'floor_number',
            'room_number',
            'capacity',
            'current_occupancy',
            'room_type',
            'facilities'
        ]