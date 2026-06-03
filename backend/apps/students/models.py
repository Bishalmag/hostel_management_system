from django.db import models


class Student(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE)

    # Personal info
    middle_name       = models.CharField(max_length=100, blank=True, null=True)
    gender            = models.CharField(max_length=20, choices=[
                          ('male','Male'),('female','Female'),('other','Other')
                        ], blank=True, null=True)
    phone             = models.CharField(max_length=20, blank=True, null=True)

    # Emergency contact
    guardian_name     = models.CharField(max_length=100, blank=True, null=True)
    guardian_relation = models.CharField(max_length=50, blank=True, null=True)
    guardian_contact  = models.CharField(max_length=20, blank=True, null=True)

    # Temporary address
    temp_address  = models.TextField(blank=True, null=True)
    temp_city     = models.CharField(max_length=100, blank=True, null=True)
    temp_state    = models.CharField(max_length=100, blank=True, null=True)

    # Permanent address
    perm_address  = models.TextField(blank=True, null=True)
    perm_city     = models.CharField(max_length=100, blank=True, null=True)
    perm_state    = models.CharField(max_length=100, blank=True, null=True)

    # Preferences
    preferred_floor = models.IntegerField(blank=True, null=True)
    assigned_room   = models.ForeignKey(
                        'hostel.Room', on_delete=models.SET_NULL,
                        blank=True, null=True
                      )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.full_name}"

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'