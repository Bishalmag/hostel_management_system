from rest_framework import serializers
from .models import RoomAllocation

class RoomAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomAllocation
        fields = '__all__'      # or list specific fields

# For creating allocation with validation
class CreateAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomAllocation
        fields = ['student', 'room_number']

    def validate_room_number(self, value):
        # Custom validation logic
        if RoomAllocation.objects.filter(room_number=value, is_active=True).exists():
            raise serializers.ValidationError("Room already occupied!")
        return value