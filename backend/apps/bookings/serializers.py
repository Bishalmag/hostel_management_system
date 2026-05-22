from rest_framework import serializers
from .models import Booking, Payment

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'student', 'room', 'check_in_date',
                  'check_out_date', 'status', 'total_amount', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'student', 'booking', 'amount',
                  'due_date', 'paid_status', 'paid_at', 'created_at']