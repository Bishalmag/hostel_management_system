from django.db import models
from apps.users.models import User


class Complaint(models.Model):
    student = models.ForeignKey('users.User', on_delete=models.CASCADE)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('resolved', 'Resolved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Complaint by {self.student.full_name} - {self.status}"

    class Meta:
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'


class DisciplinaryAction(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    action_taken = models.TextField()
    discipline_incharge = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Action for {self.complaint}"

    class Meta:
        verbose_name = 'Disciplinary Action'
        verbose_name_plural = 'Disciplinary Actions'