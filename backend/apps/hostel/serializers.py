from rest_framework import serializers
from .models import Hostel, Block, Floor, Room


class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'created_at', 'updated_at']


class BlockSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)

    class Meta:
        model = Block
        fields = ['id', 'hostel', 'hostel_name', 'name', 'created_at', 'updated_at']


class FloorSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    hostel = serializers.IntegerField(source='block.hostel.id', read_only=True)
    hostel_name = serializers.CharField(source='block.hostel.name', read_only=True)

    class Meta:
        model = Floor
        fields = ['id', 'block', 'block_name', 'hostel', 'hostel_name', 'floor_number', 'created_at', 'updated_at']


class RoomSerializer(serializers.ModelSerializer):
    block = serializers.IntegerField(source='floor.block.id', read_only=True)
    block_name = serializers.CharField(source='floor.block.name', read_only=True)
    hostel = serializers.IntegerField(source='floor.block.hostel.id', read_only=True)
    hostel_name = serializers.CharField(source='floor.block.hostel.name', read_only=True)
    floor_number = serializers.IntegerField(source='floor.floor_number', read_only=True)
    
    # Add these properties
    is_available = serializers.BooleanField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    full_description = serializers.CharField(read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'hostel', 'hostel_name', 'block', 'block_name', 'floor', 'floor_number',
            'room_number', 'capacity', 'current_occupancy', 'room_type', 'ac_type', 'bathroom_type',
            'price_per_month', 'is_available', 'available_spots', 'full_description',
            'created_at', 'updated_at'
        ]