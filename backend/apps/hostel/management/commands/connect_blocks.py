# apps/hostel/management/commands/connect_blocks.py
from django.core.management.base import BaseCommand
from apps.hostel.models import Block, LocationNode, NodeEdge

class Command(BaseCommand):
    help = 'Connect all blocks with navigation edges'

    def handle(self, *args, **options):
        self.stdout.write('🏗️ Connecting all blocks...')
        
        blocks = Block.objects.all()
        created = 0
        
        for i, block in enumerate(blocks):
            # Connect floors within block
            nodes = LocationNode.objects.filter(block=block)
            if nodes.count() < 2:
                continue
            
            # Group by floor
            nodes_by_floor = {}
            for node in nodes:
                if node.floor:
                    if node.floor.id not in nodes_by_floor:
                        nodes_by_floor[node.floor.id] = []
                    nodes_by_floor[node.floor.id].append(node)
            
            # Connect nodes on same floor
            for floor_id, floor_nodes in nodes_by_floor.items():
                floor_nodes.sort(key=lambda x: x.name)
                for j in range(len(floor_nodes) - 1):
                    from_node = floor_nodes[j]
                    to_node = floor_nodes[j + 1]
                    
                    edge_exists = NodeEdge.objects.filter(
                        from_node=from_node, to_node=to_node
                    ).exists() or NodeEdge.objects.filter(
                        from_node=to_node, to_node=from_node
                    ).exists()
                    
                    if not edge_exists:
                        NodeEdge.objects.create(
                            from_node=from_node,
                            to_node=to_node,
                            weight=1.0,
                            bidirectional=True
                        )
                        created += 1
                        self.stdout.write(f"  🔗 {from_node.name} ↔ {to_node.name}")
            
            # Connect floors vertically
            floor_ids = sorted(nodes_by_floor.keys())
            for j in range(len(floor_ids) - 1):
                floor_1_nodes = nodes_by_floor[floor_ids[j]]
                floor_2_nodes = nodes_by_floor[floor_ids[j + 1]]
                
                if floor_1_nodes and floor_2_nodes:
                    from_node = floor_1_nodes[0]
                    to_node = floor_2_nodes[0]
                    
                    edge_exists = NodeEdge.objects.filter(
                        from_node=from_node, to_node=to_node
                    ).exists() or NodeEdge.objects.filter(
                        from_node=to_node, to_node=from_node
                    ).exists()
                    
                    if not edge_exists:
                        NodeEdge.objects.create(
                            from_node=from_node,
                            to_node=to_node,
                            weight=1.5,
                            bidirectional=True
                        )
                        created += 1
                        self.stdout.write(f"  🪜 {from_node.name} ↔ {to_node.name}")
            
            # Connect to next block
            if i < len(blocks) - 1:
                next_block = blocks[i + 1]
                this_nodes = LocationNode.objects.filter(block=block).order_by('floor__floor_number')
                next_nodes = LocationNode.objects.filter(block=next_block).order_by('floor__floor_number')
                
                if this_nodes.exists() and next_nodes.exists():
                    from_node = this_nodes.first()
                    to_node = next_nodes.first()
                    
                    edge_exists = NodeEdge.objects.filter(
                        from_node=from_node, to_node=to_node
                    ).exists() or NodeEdge.objects.filter(
                        from_node=to_node, to_node=from_node
                    ).exists()
                    
                    if not edge_exists:
                        NodeEdge.objects.create(
                            from_node=from_node,
                            to_node=to_node,
                            weight=2.0,
                            bidirectional=True
                        )
                        created += 1
                        self.stdout.write(f"  🏢 {block.name} ↔ {next_block.name}")
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {created} connections!'))