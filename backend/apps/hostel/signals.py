# apps/hostel/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Room, LocationNode, NodeEdge, Block, Floor

# List of non-residential purposes that should have nodes
NAV_PURPOSES = ['reception', 'office', 'lobby', 'DI_room', 'library', 'canteen', 'hall']


@receiver(post_save, sender=Room)
def create_room_node(sender, instance, created, **kwargs):
    """
    Auto-create LocationNode when a room is marked as a navigable purpose
    (reception, office, lobby, DI_room, library, canteen, hall)
    """
    if instance.room_purpose in NAV_PURPOSES:
        # Create or update node for this room
        node, node_created = LocationNode.objects.get_or_create(
            room=instance,
            defaults={
                'name': f"{instance.get_room_purpose_display()} - {instance.room_number}",
                'node_type': 'room',
                'block': instance.floor.block if instance.floor else None,
                'floor': instance.floor
            }
        )
        if node_created:
            print(f"✅ Created LocationNode for {instance.room_purpose} room {instance.room_number}")
            # Auto-connect this node to nearby nodes
            auto_connect_node(node)
        else:
            # Update existing node if needed
            node.name = f"{instance.get_room_purpose_display()} - {instance.room_number}"
            node.block = instance.floor.block if instance.floor else None
            node.floor = instance.floor
            node.save()
            print(f"🔄 Updated LocationNode for {instance.room_purpose} room {instance.room_number}")
    else:
        # Delete node if room is residential or doesn't have a navigable purpose
        deleted = LocationNode.objects.filter(room=instance).delete()
        if deleted[0] > 0:
            print(f"🗑️ Deleted LocationNode for room {instance.room_number} (purpose: {instance.room_purpose})")


@receiver(post_delete, sender=Room)
def delete_room_node(sender, instance, **kwargs):
    """Delete LocationNode when room is deleted"""
    deleted = LocationNode.objects.filter(room=instance).delete()
    if deleted[0] > 0:
        print(f"🗑️ Deleted LocationNode for deleted room {instance.room_number}")


@receiver(post_save, sender=Block)
def create_block_connections(sender, instance, created, **kwargs):
    """
    Auto-create connections when a new block is added
    """
    if created:
        print(f"🏗️ New block created: {instance.name}")
        # Create connections for this block after a short delay
        # (to allow rooms/nodes to be created first)
        from django.db import connection
        connection.on_commit(lambda: create_connections_for_block(instance))


@receiver(post_save, sender=Floor)
def create_staircase_connection(sender, instance, created, **kwargs):
    """
    Auto-create staircase connection when a new floor is added
    """
    if created:
        print(f"🪜 New floor created: {instance}")
        # Connect this floor to the floor above and below
        connect_floor_staircase(instance)


def connect_floor_staircase(floor):
    """
    Connect a floor to the floor above and below using staircases
    """
    # Get all nodes on this floor
    floor_nodes = LocationNode.objects.filter(floor=floor)
    
    if not floor_nodes.exists():
        return
    
    # Connect to floor below
    floor_below = Floor.objects.filter(
        block=floor.block,
        floor_number=floor.floor_number - 1
    ).first()
    
    if floor_below:
        below_nodes = LocationNode.objects.filter(floor=floor_below)
        if below_nodes.exists():
            # Create staircase edge between the first nodes of each floor
            from_node = floor_nodes.first()
            to_node = below_nodes.first()
            
            edge_exists = NodeEdge.objects.filter(
                from_node=from_node, to_node=to_node
            ).exists() or NodeEdge.objects.filter(
                from_node=to_node, to_node=from_node
            ).exists()
            
            if not edge_exists:
                NodeEdge.objects.create(
                    from_node=from_node,
                    to_node=to_node,
                    weight=1.5,  # Stairs have higher weight than walking
                    bidirectional=True
                )
                print(f"🪜 Created staircase: {from_node.name} ↔ {to_node.name}")
    
    # Connect to floor above
    floor_above = Floor.objects.filter(
        block=floor.block,
        floor_number=floor.floor_number + 1
    ).first()
    
    if floor_above:
        above_nodes = LocationNode.objects.filter(floor=floor_above)
        if above_nodes.exists():
            from_node = floor_nodes.first()
            to_node = above_nodes.first()
            
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
                print(f"🪜 Created staircase: {from_node.name} ↔ {to_node.name}")


def auto_connect_node(node):
    """
    Automatically connect a node to nearby nodes on the same floor
    and to the nearest node in the same block
    """
    if not node.floor:
        return
    
    # Get all nodes on the same floor
    same_floor_nodes = LocationNode.objects.filter(
        floor=node.floor
    ).exclude(id=node.id)
    
    # Connect to nearby nodes on the same floor
    for other in same_floor_nodes:
        # Check if edge already exists
        edge_exists = NodeEdge.objects.filter(
            from_node=node, to_node=other
        ).exists() or NodeEdge.objects.filter(
            from_node=other, to_node=node
        ).exists()
        
        if not edge_exists:
            # Calculate weight based on distance (if you have coordinates)
            weight = 1.0
            NodeEdge.objects.create(
                from_node=node,
                to_node=other,
                weight=weight,
                bidirectional=True
            )
            print(f"🔗 Connected {node.name} ↔ {other.name}")
    
    # Connect to the nearest node on the floor below/above (vertical connections)
    if node.block:
        connect_vertical(node)


def connect_vertical(node):
    """
    Connect a node to the nearest node on the floor above and below
    """
    if not node.floor or not node.block:
        return
    
    current_floor_num = node.floor.floor_number
    
    # Find nodes on floor above and below in the same block
    for floor_delta in [-1, 1]:
        target_floor_num = current_floor_num + floor_delta
        target_floor = Floor.objects.filter(
            block=node.block,
            floor_number=target_floor_num
        ).first()
        
        if target_floor:
            target_nodes = LocationNode.objects.filter(floor=target_floor)
            if target_nodes.exists():
                # Connect to the first node on that floor
                target = target_nodes.first()
                edge_exists = NodeEdge.objects.filter(
                    from_node=node, to_node=target
                ).exists() or NodeEdge.objects.filter(
                    from_node=target, to_node=node
                ).exists()
                
                if not edge_exists:
                    NodeEdge.objects.create(
                        from_node=node,
                        to_node=target,
                        weight=1.5,  # Stairs have higher weight
                        bidirectional=True
                    )
                    print(f"🪜 Connected {node.name} ↔ {target.name} (stairs)")


def create_connections_for_block(block):
    """
    Create default connections for a new block
    """
    # Get all nodes in this block
    nodes = LocationNode.objects.filter(block=block)
    
    if nodes.count() < 2:
        print(f"⚠️ Not enough nodes in {block.name} to create connections")
        return
    
    # Group nodes by floor
    nodes_by_floor = {}
    for node in nodes:
        if node.floor:
            if node.floor.id not in nodes_by_floor:
                nodes_by_floor[node.floor.id] = []
            nodes_by_floor[node.floor.id].append(node)
    
    created = 0
    
    # Connect nodes on the same floor
    for floor_id, floor_nodes in nodes_by_floor.items():
        # Sort by name for consistent ordering
        floor_nodes.sort(key=lambda x: x.name)
        
        for i in range(len(floor_nodes) - 1):
            from_node = floor_nodes[i]
            to_node = floor_nodes[i + 1]
            
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
                print(f"🔗 Connected {from_node.name} ↔ {to_node.name}")
    
    # Connect floors vertically (staircases)
    floor_ids = sorted(nodes_by_floor.keys())
    for i in range(len(floor_ids) - 1):
        floor_1_nodes = nodes_by_floor[floor_ids[i]]
        floor_2_nodes = nodes_by_floor[floor_ids[i + 1]]
        
        if floor_1_nodes and floor_2_nodes:
            from_node = floor_1_nodes[0]  # First node on floor
            to_node = floor_2_nodes[0]     # First node on floor above
            
            edge_exists = NodeEdge.objects.filter(
                from_node=from_node, to_node=to_node
            ).exists() or NodeEdge.objects.filter(
                from_node=to_node, to_node=from_node
            ).exists()
            
            if not edge_exists:
                NodeEdge.objects.create(
                    from_node=from_node,
                    to_node=to_node,
                    weight=1.5,  # Staircase weight
                    bidirectional=True
                )
                created += 1
                print(f"🪜 Created staircase: {from_node.name} ↔ {to_node.name}")
    
    # Connect to nearest node in adjacent block (if exists)
    connect_to_nearest_block(block)
    
    print(f"✅ Created {created} connections for block {block.name}")


def connect_to_nearest_block(block):
    """
    Connect this block to the nearest block
    """
    # Get all blocks except this one
    other_blocks = Block.objects.exclude(id=block.id)
    
    if not other_blocks.exists():
        return
    
    # Get nodes at the ground floor of this block
    this_nodes = LocationNode.objects.filter(
        block=block
    ).order_by('floor__floor_number')
    
    if not this_nodes.exists():
        return
    
    # Get ground floor nodes of this block
    ground_floor = this_nodes.first().floor
    this_ground_nodes = LocationNode.objects.filter(
        block=block,
        floor=ground_floor
    )
    
    if not this_ground_nodes.exists():
        return
    
    # Connect to each other block
    for other_block in other_blocks:
        other_nodes = LocationNode.objects.filter(
            block=other_block
        ).order_by('floor__floor_number')
        
        if not other_nodes.exists():
            continue
        
        # Get ground floor nodes of other block
        other_ground_floor = other_nodes.first().floor
        other_ground_nodes = LocationNode.objects.filter(
            block=other_block,
            floor=other_ground_floor
        )
        
        if not other_ground_nodes.exists():
            continue
        
        # Connect the first node of this block's ground floor to the other block's ground floor
        from_node = this_ground_nodes.first()
        to_node = other_ground_nodes.first()
        
        edge_exists = NodeEdge.objects.filter(
            from_node=from_node, to_node=to_node
        ).exists() or NodeEdge.objects.filter(
            from_node=to_node, to_node=from_node
        ).exists()
        
        if not edge_exists:
            NodeEdge.objects.create(
                from_node=from_node,
                to_node=to_node,
                weight=2.0,  # Between blocks is slightly longer
                bidirectional=True
            )
            print(f"🏢 Connected {block.name} ↔ {other_block.name}")


# ── Manual function to connect all existing blocks ──
def connect_all_blocks():
    """
    Manually connect all existing blocks (useful for initial setup)
    """
    blocks = Block.objects.all()
    print(f"🏗️ Connecting {blocks.count()} blocks...")
    
    for block in blocks:
        create_connections_for_block(block)
    
    print("✅ All blocks connected!")


def connect_all_staircases():
    """
    Manually connect all staircases (useful for initial setup)
    """
    floors = Floor.objects.all()
    print(f"🪜 Connecting staircases for {floors.count()} floors...")
    
    for floor in floors:
        connect_floor_staircase(floor)
    
    print("✅ All staircases connected!")