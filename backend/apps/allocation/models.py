from django.db import models
from apps.students.models import Student
from apps.hostel.models import Room


class RoomPreference(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE)
    attributes = models.JSONField(default=dict, blank=True)  # Stores JSONB
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.room}"

    class Meta:
        verbose_name = 'Room Preference'
        verbose_name_plural = 'Room Preferences'


class StudentPreference(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    preferences = models.JSONField(default=dict, blank=True)  # Stores JSONB
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.student}"

    class Meta:
        verbose_name = 'Student Preference'
        verbose_name_plural = 'Student Preferences'


class MatchingResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    allocation_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} allocated to {self.room} on {self.allocation_date}"

    class Meta:
        verbose_name = 'Matching Result'
        verbose_name_plural = 'Matching Results'
        unique_together = ('student', 'room')



class Allocation(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    student = models.OneToOneField(
        Student, on_delete=models.CASCADE, related_name='allocation'
    )
    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, related_name='allocations'
    )
    allocated_on = models.DateField(auto_now_add=True)
    valid_until = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    allocated_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.student} → {self.room} ({self.status})"

    class Meta:
        verbose_name = 'Allocation'
        verbose_name_plural = 'Allocations'