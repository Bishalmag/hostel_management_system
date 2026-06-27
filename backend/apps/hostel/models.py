# models.py
from django.db import models


class Hostel(models.Model):
    name       = models.CharField(max_length=100)
    address    = models.TextField(blank=True, null=True)
    latitude   = models.DecimalField(max_digits=50, decimal_places=6, null=True, blank=True)
    longitude  = models.DecimalField(max_digits=50, decimal_places=6, null=True, blank=True)
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

    def __str__(self):
        return f"{self.block.hostel.name} - {self.block.name} - Floor {self.floor_number}"

    class Meta:
        verbose_name = 'Floor'
        verbose_name_plural = 'Floors'
        unique_together = ('block', 'floor_number')


class Room(models.Model):
    ROOM_TYPE_CHOICES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('triple', 'Triple'),
    ]
    
    ROOM_PURPOSE_CHOICES = [
        ('residential', 'Residential'),
        ('reception', 'Reception'),
        ('office', 'Office'),
        ('lobby', 'Lobby'),
        ('DI_room', 'DI Room'),
        ('library', 'Library'),
        ('canteen', 'Canteen'),
        ('hall', 'Hall'),
    ]
    
    AC_CHOICES = [
        ('ac',     'AC'),
        ('non_ac', 'Non-AC'),
    ]
    
    BATHROOM_CHOICES = [
        ('attached', 'Attached Bathroom'),
        ('shared',   'Shared Bathroom'),
    ]

    floor             = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='rooms')
    room_number       = models.CharField(max_length=10)
    capacity          = models.IntegerField()
    current_occupancy = models.IntegerField(default=0)
    room_type         = models.CharField(max_length=10, choices=ROOM_TYPE_CHOICES)
    room_purpose      = models.CharField(max_length=20, choices=ROOM_PURPOSE_CHOICES, default='residential')
    ac_type           = models.CharField(max_length=10, choices=AC_CHOICES, default='non_ac')
    bathroom_type     = models.CharField(max_length=10, choices=BATHROOM_CHOICES, default='shared')
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)
    price_per_month   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.floor.block.hostel.name} - Room {self.room_number} ({self.get_room_type_display()}, {self.get_ac_type_display()}, {self.get_bathroom_type_display()})"

    @property
    def is_available(self):
        # Only residential rooms can be booked
        return self.room_purpose == 'residential' and self.current_occupancy < self.capacity

    @property
    def available_spots(self):
        return self.capacity - self.current_occupancy if self.room_purpose == 'residential' else 0

    @property
    def full_description(self):
        return f"{self.get_room_type_display()} Room, {self.get_ac_type_display()}, {self.get_bathroom_type_display()}"

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        unique_together = ('floor', 'room_number')


# ── Navigation / Pathfinding ──────────────────────────────

class LocationNode(models.Model):
    NODE_TYPES = [
        ('entrance', 'Entrance'),
        ('block',    'Block'),
        ('floor',    'Floor'),
        ('room',     'Room'),
        ('common',   'Common Area'),
    ]
    name      = models.CharField(max_length=100)
    node_type = models.CharField(max_length=20, choices=NODE_TYPES)
    block     = models.ForeignKey(Block,  null=True, blank=True, on_delete=models.SET_NULL)
    floor     = models.ForeignKey(Floor,  null=True, blank=True, on_delete=models.SET_NULL)
    room      = models.ForeignKey(Room,   null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self): return f"[{self.node_type}] {self.name}"

    class Meta:
        db_table = 'hostel_location_node'


class NodeEdge(models.Model):
    from_node     = models.ForeignKey(LocationNode, related_name='edges_out', on_delete=models.CASCADE)
    to_node       = models.ForeignKey(LocationNode, related_name='edges_in',  on_delete=models.CASCADE)
    weight        = models.FloatField(default=1.0)
    bidirectional = models.BooleanField(default=True)

    def __str__(self):
        arrow = '↔' if self.bidirectional else '→'
        return f"{self.from_node.name} {arrow} {self.to_node.name} (w={self.weight})"

    class Meta:
        db_table = 'hostel_node_edge'
        unique_together = ('from_node', 'to_node')