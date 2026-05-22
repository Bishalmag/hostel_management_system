from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN       = 'SUPER_ADMIN',       'Super Admin'
        HOSTEL_ADMIN      = 'HOSTEL_ADMIN',      'Hostel Admin'
        DISCIPLINE_INCHARGE = 'DISCIPLINE_INCHARGE', 'Discipline Incharge'
        WARDEN            = 'WARDEN',            'Warden'
        STUDENT           = 'STUDENT',           'Student'

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.STUDENT
    )

    def is_super_admin(self):        return self.role == self.Role.SUPER_ADMIN
    def is_hostel_admin(self):       return self.role == self.Role.HOSTEL_ADMIN
    def is_discipline_incharge(self):return self.role == self.Role.DISCIPLINE_INCHARGE
    def is_warden(self):             return self.role == self.Role.WARDEN
    def is_student(self):            return self.role == self.Role.STUDENT

    def __str__(self):
        return f"{self.username} ({self.role})"