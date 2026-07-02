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
        student = data.get('student')
        if student:
            room = data.get('room')
            check_in = data.get('check_in_date')
            check_out = data.get('check_out_date')
            
            if room and check_in and check_out:
                # Check if dates are valid
                if check_in > check_out:
                    raise serializers.ValidationError(
                        "Check-in date must be before check-out date"
                    )

                overlapping_bookings = Booking.objects.filter(
                    room=room,
                    status__in=['pending', 'approved'],
                    check_in_date__lt=check_out,
                    check_out_date__gt=check_in
                )
                
                if self.instance:
                    overlapping_bookings = overlapping_bookings.exclude(id=self.instance.id)
                
                if overlapping_bookings.count() >= room.capacity:
                    raise serializers.ValidationError(
                        f"Room {room.room_number} is already fully booked for the selected dates. "
                        f"Capacity: {room.capacity}, Already booked: {overlapping_bookings.count()}"
                    )
                
                if room.current_occupancy >= room.capacity:
                    approved_overlapping = overlapping_bookings.filter(status='approved')
                    if approved_overlapping.count() >= room.capacity:
                        raise serializers.ValidationError(
                            f"Room {room.room_number} is currently fully occupied by approved bookings"
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