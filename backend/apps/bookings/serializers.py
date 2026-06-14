from rest_framework import serializers
from .models import Booking, Payment

class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'student', 'student_name', 'room', 'room_number', 
                  'check_in_date', 'check_out_date', 'status', 'total_amount', 
                  'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    booking_room = serializers.CharField(source='booking.room.room_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'student', 'student_name', 'booking', 'booking_room', 
                  'amount', 'due_date', 'paid_status', 'paid_at', 'created_at',
                  'transaction_uuid', 'transaction_code', 'receipt_number']
        read_only_fields = ['transaction_uuid', 'transaction_code', 'receipt_number']
