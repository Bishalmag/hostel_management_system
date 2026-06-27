# backend/apps/hostel/management/commands/populate_location_data.py

from django.core.management.base import BaseCommand
from apps.hostel.models import Hostel, Block, Floor, Room, LocationNode, NodeEdge

class Command(BaseCommand):
    help = 'Populate location nodes and edges for pathfinding'

    def handle(self, *args, **options):
        self.stdout.write('Creating location nodes...')
        
        # Get or create hostel
        hostel, _ = Hostel.objects.get_or_create(
            name="Main Hostel",
            defaults={'address': "123 University Road"}
        )
        
        # Get or create blocks
        block_a, _ = Block.objects.get_or_create(
            hostel=hostel,
            name="Block A"
        )
        block_b, _ = Block.objects.get_or_create(
            hostel=hostel,
            name="Block B"
        )
        
        # Get or create floors
        floor_1, _ = Floor.objects.get_or_create(
            block=block_a,
            floor_number=1
        )
        floor_2, _ = Floor.objects.get_or_create(
            block=block_a,
            floor_number=2
        )
        
        # Get or create rooms
        room_101, _ = Room.objects.get_or_create(
            floor=floor_1,
            room_number="101",
            defaults={
                'capacity': 2,
                'current_occupancy': 0,
                'room_type': 'double',
                'ac_type': 'ac',
                'bathroom_type': 'attached',
                'price_per_month': 15000.00
            }
        )
        
        # Create Location Nodes
        nodes = {
            'entrance': LocationNode.objects.get_or_create(
                name="Main Entrance",
                defaults={'node_type': 'entrance'}
            )[0],
            'block_a': LocationNode.objects.get_or_create(
                name="Block A",
                defaults={'node_type': 'block', 'block': block_a}
            )[0],
            'floor_1': LocationNode.objects.get_or_create(
                name="Block A - Floor 1",
                defaults={'node_type': 'floor', 'block': block_a, 'floor': floor_1}
            )[0],
            'room_101': LocationNode.objects.get_or_create(
                name="Room 101",
                defaults={'node_type': 'room', 'block': block_a, 'floor': floor_1, 'room': room_101}
            )[0],
            'canteen': LocationNode.objects.get_or_create(
                name="Canteen",
                defaults={'node_type': 'common'}
            )[0],
            'library': LocationNode.objects.get_or_create(
                name="Library",
                defaults={'node_type': 'common'}
            )[0],
        }
        
        # Create Node Edges (connections)
        edges = [
            (nodes['entrance'], nodes['block_a'], 10.0),
            (nodes['block_a'], nodes['floor_1'], 2.0),
            (nodes['floor_1'], nodes['room_101'], 1.5),
            (nodes['block_a'], nodes['canteen'], 5.0),
            (nodes['block_a'], nodes['library'], 8.0),
            (nodes['canteen'], nodes['library'], 3.0),
        ]
        
        for from_node, to_node, weight in edges:
            edge, created = NodeEdge.objects.get_or_create(
                from_node=from_node,
                to_node=to_node,
                defaults={'weight': weight, 'bidirectional': True}
            )
            if created:
                self.stdout.write(f'Created edge: {from_node.name} ↔ {to_node.name}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated location data!'))
        self.stdout.write(f'Created {LocationNode.objects.count()} nodes')
        self.stdout.write(f'Created {NodeEdge.objects.count()} edges')