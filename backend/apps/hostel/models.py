from django.db import models


class Hostel(models.Model):
    name       = models.CharField(max_length=100)
    address    = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return self.name

    class Meta:
        verbose_name = 'Hostel'
        verbose_name_plural = 'Hostels'


class Block(models.Model):
    hostel     = models.ForeignKey(Hostel, on_delete=models.CASCADE)
    name       = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return f"{self.hostel.name} - {self.name}"

    class Meta:
        verbose_name = 'Block'
        verbose_name_plural = 'Blocks'


class Floor(models.Model):
    block        = models.ForeignKey(Block, on_delete=models.CASCADE)
    floor_number = models.IntegerField()
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self): return f"{self.block.hostel.name} - {self.block.name} - Floor {self.floor_number}"

    class Meta:
        verbose_name = 'Floor'
        verbose_name_plural = 'Floors'
        unique_together = ('block', 'floor_number')


class Room(models.Model):
    ROOM_TYPE_CHOICES = [('single','Single'),('shared','Shared')]

    floor             = models.ForeignKey(Floor, on_delete=models.CASCADE)
    room_number       = models.CharField(max_length=10)
    capacity          = models.IntegerField()
    current_occupancy = models.IntegerField(default=0)
    facilities        = models.JSONField(default=dict, blank=True)
    room_type         = models.CharField(max_length=10, choices=ROOM_TYPE_CHOICES)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.floor.block.hostel.name} - Room {self.room_number}"

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        unique_together = ('floor', 'room_number')