from django.db import models
from django.utils import timezone

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey('hostel.Room', on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.student.user.full_name} - {self.status}"

    @property
    def duration_days(self):
        """Calculate number of days between check-in and check-out"""
        return (self.check_out_date - self.check_in_date).days

    @property
    def is_active(self):
        """Check if booking is currently active"""
        return self.status == 'approved' and self.check_in_date <= timezone.now().date() <= self.check_out_date

    @property
    def is_upcoming(self):
        """Check if booking is in the future"""
        return self.status == 'approved' and self.check_in_date > timezone.now().date()

    def approve(self):
        """Admin approves the booking. Independent of payment status."""
        self.status = 'approved'
        self.save()

    def reject(self):
        """Admin rejects the booking."""
        self.status = 'rejected'
        self.save()

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='payments')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    paid_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # eSewa fields
    transaction_uuid = models.CharField(max_length=100, unique=True, null=True, blank=True)
    transaction_code = models.CharField(max_length=100, null=True, blank=True)
    receipt_number = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return f"Payment #{self.id} - {self.student.user.full_name} - {self.paid_status} - ₹{self.amount}"

    @property
    def is_paid(self):
        """Check if payment is completed"""
        return self.paid_status == 'paid'

    @property
    def is_overdue(self):
        """Check if payment is overdue"""
        return self.paid_status == 'pending' and self.due_date < timezone.now().date()

    def generate_receipt_number(self):
        """Generate a unique receipt number"""
        import random
        import string
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.digits, k=5))
        return f"RCP-{date_str}-{random_str}"

    def mark_as_paid(self, transaction_code=None):
        """Mark payment as paid. Does NOT change booking status — admin approves separately."""
        self.paid_status = 'paid'
        self.paid_at = timezone.now()
        if transaction_code:
            self.transaction_code = transaction_code
        if not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        self.save()

    def mark_as_failed(self):
        """Mark payment as failed"""
        self.paid_status = 'failed'
        self.save()

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'