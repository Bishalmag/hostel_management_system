# apps/bookings/admin.py
from django.contrib import admin
from django.utils import timezone
from .models import Booking, Payment


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'room', 'check_in_date', 'check_out_date', 'status', 'is_paid']
    list_filter = ['status', 'check_in_date']
    search_fields = ['student__user__full_name', 'room__room_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('student', 'room', 'check_in_date', 'check_out_date', 'status')
        }),
        ('Payment', {
            'fields': ('total_amount', 'get_payment_status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_paid(self, obj):
        """Check if booking has been paid for"""
        payment = obj.payments.filter(paid_status='paid').first()
        return payment is not None
    is_paid.boolean = True
    is_paid.short_description = 'Paid?'
    
    def get_payment_status(self, obj):
        """Get payment status for the booking"""
        payment = obj.payments.filter(paid_status='paid').first()
        if payment:
            return f"Paid (${payment.amount})"
        pending_payment = obj.payments.filter(paid_status='pending').first()
        if pending_payment:
            return f"Pending (${pending_payment.amount})"
        return "No payment"
    get_payment_status.short_description = 'Payment Status'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'booking', 'amount', 'paid_status', 'paid_at']
    list_filter = ['paid_status']
    search_fields = ['student__user__full_name', 'booking__id']
    readonly_fields = ['transaction_uuid', 'transaction_code', 'receipt_number']