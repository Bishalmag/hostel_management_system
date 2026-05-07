from django.db import models
from apps.users.models import User
from apps.hostel.models import Room


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    preferred_floor = models.IntegerField(blank=True, null=True)
    roommate_type = models.CharField(
        max_length=20,
        choices=[
            ('introvert', 'Introvert'),
            ('extrovert', 'Extrovert'),
        ],
        blank=True, null=True
    )
    noise_tolerance = models.TextField(blank=True, null=True)
    study_habits = models.TextField(blank=True, null=True)
    assigned_room = models.ForeignKey(Room, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.full_name}"

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'