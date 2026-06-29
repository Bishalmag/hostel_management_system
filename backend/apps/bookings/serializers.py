# apps/bookings/serializers.py
from rest_framework import serializers
from .models import Booking, Payment


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    is_paid = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ['id', 'student', 'student_name', 'room', 'room_number', 
                  'check_in_date', 'check_out_date', 'status', 'total_amount', 
                  'created_at', 'updated_at', 'is_paid', 'payment_status']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_paid(self, obj):
        """Check if booking has been paid for"""
        return obj.payments.filter(paid_status='paid').exists()
    
    def get_payment_status(self, obj):
        """Get payment status for the booking"""
        paid_payment = obj.payments.filter(paid_status='paid').first()
        if paid_payment:
            return 'paid'
        pending_payment = obj.payments.filter(paid_status='pending').first()
        if pending_payment:
            return 'pending'
        return 'unpaid'
    
    def validate_total_amount(self, value):
        """Ensure total_amount is a valid decimal"""
        if value is not None:
            try:
                return float(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("Total amount must be a valid number")
        return value
    
    def validate(self, data):
        """Validate booking data"""
        # Check if student exists
        student = data.get('student')
        if student:
            # Check if student has any pending/approved bookings for this room
            room = data.get('room')
            check_in = data.get('check_in_date')
            check_out = data.get('check_out_date')
            
            if room and check_in and check_out:
                # Check if dates are valid
                if check_in > check_out:
                    raise serializers.ValidationError("Check-in date must be before check-out date")
                
                # Check if room is available
                if room.current_occupancy >= room.capacity:
                    raise serializers.ValidationError(
                        f"Room {room.room_number} is fully occupied (Capacity: {room.capacity})"
                    )
                
                # Check for overlapping bookings
                overlapping = Booking.objects.filter(
                    room=room,
                    status__in=['pending', 'approved'],
                    check_in_date__lt=check_out,
                    check_out_date__gt=check_in
                )
                if self.instance:
                    overlapping = overlapping.exclude(id=self.instance.id)
                
                if overlapping.exists():
                    raise serializers.ValidationError(
                        "This room is already booked for the selected dates"
                    )
        
        return data


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    booking_room = serializers.CharField(source='booking.room.room_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'student', 'student_name', 'booking', 'booking_room', 
                  'amount', 'due_date', 'paid_status', 'paid_at', 'created_at',
                  'transaction_uuid', 'transaction_code', 'receipt_number']
        read_only_fields = ['transaction_uuid', 'transaction_code', 'receipt_number']