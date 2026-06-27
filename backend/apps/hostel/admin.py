from django.contrib import admin
from .models import Hostel, Block, Floor, Room, LocationNode, NodeEdge


@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'address', 'created_at']
    list_filter   = ['created_at']
    search_fields = ['name', 'address']


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'hostel', 'created_at']
    list_filter   = ['hostel']
    search_fields = ['name']


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display  = ['id', 'floor_number', 'block', 'created_at']
    list_filter   = ['block__hostel', 'block']
    search_fields = ['block__name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display    = ['id', 'room_number', 'room_type', 'ac_type', 'bathroom_type',
                       'capacity', 'current_occupancy', 'price_per_month', 'is_available']
    list_filter     = ['room_type', 'ac_type', 'bathroom_type', 'floor__block__hostel']
    search_fields   = ['room_number']
    list_editable   = ['price_per_month']
    readonly_fields = ['created_at', 'updated_at']

    def is_available(self, obj): return obj.is_available
    is_available.boolean = True


# ── NEW ──────────────────────────────────────────────
@admin.register(LocationNode)
class LocationNodeAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'node_type', 'block', 'floor', 'room']
    list_filter   = ['node_type']
    search_fields = ['name']


@admin.register(NodeEdge)
class NodeEdgeAdmin(admin.ModelAdmin):
    list_display  = ['id', 'from_node', 'to_node', 'weight', 'bidirectional']
    list_filter   = ['bidirectional']
    search_fields = ['from_node__name', 'to_node__name']