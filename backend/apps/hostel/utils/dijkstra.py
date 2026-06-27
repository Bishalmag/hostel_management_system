# apps/hostel/utils/dijkstra.py
import heapq
from ..models import LocationNode, NodeEdge

def build_graph(edges):
    """Build graph from edges for Dijkstra's algorithm"""
    graph = {}
    
    for edge in edges:
        from_node = edge.from_node.id
        to_node = edge.to_node.id
        weight = edge.weight
        edge_id = edge.id  # Store edge id for reference
        
        if from_node not in graph:
            graph[from_node] = {}
        graph[from_node][to_node] = {
            'weight': weight,
            'edge_id': edge.id,
            'bidirectional': edge.bidirectional
        }
        
        if edge.bidirectional:
            if to_node not in graph:
                graph[to_node] = {}
            graph[to_node][from_node] = {
                'weight': weight,
                'edge_id': edge.id,
                'bidirectional': edge.bidirectional
            }
    
    return graph


def detect_staircase(from_node_id, to_node_id):
    """
    Detect if moving between two nodes involves a staircase
    (different floors in the same block)
    """
    try:
        from_node = LocationNode.objects.get(id=from_node_id)
        to_node = LocationNode.objects.get(id=to_node_id)
        
        # If they're on different floors in the same block, it's a staircase
        if (from_node.floor and to_node.floor and 
            from_node.floor.block_id == to_node.floor.block_id and
            from_node.floor.id != to_node.floor.id):
            return True
            
        return False
    except LocationNode.DoesNotExist:
        return False


def get_step_description(from_node_id, to_node_id, edge_weight):
    """
    Get a human-readable description of a step in the path
    """
    try:
        from_node = LocationNode.objects.get(id=from_node_id)
        to_node = LocationNode.objects.get(id=to_node_id)
        
        # Check if it's a staircase
        if (from_node.floor and to_node.floor and 
            from_node.floor.block_id == to_node.floor.block_id and
            from_node.floor.id != to_node.floor.id):
            
            floor_diff = to_node.floor.floor_number - from_node.floor.floor_number
            direction = "up" if floor_diff > 0 else "down"
            return f"Take stairs {direction} to {to_node.name} (Floor {to_node.floor.floor_number})"
        
        # Same floor - just walking
        return f"Walk to {to_node.name}"
        
    except LocationNode.DoesNotExist:
        return f"Move to node {to_node_id}"


def dijkstra(graph, start, end):
    """
    Find shortest path using Dijkstra's algorithm
    Returns dict with path, total_cost, found status, and detailed steps
    """
    if start not in graph or end not in graph:
        return {"found": False, "path": [], "total_cost": 0, "steps": []}
    
    # Initialize distances and previous nodes
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {node: None for node in graph}
    previous_edge = {node: None for node in graph}
    
    # Priority queue
    pq = [(0, start)]
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        if current_distance > distances[current_node]:
            continue
        
        if current_node == end:
            break
        
        for neighbor, data in graph[current_node].items():
            weight = data['weight']
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                previous_edge[neighbor] = data['edge_id']
                heapq.heappush(pq, (distance, neighbor))
    
    # Check if path exists
    if distances[end] == float('inf'):
        return {"found": False, "path": [], "total_cost": 0, "steps": []}
    
    # Reconstruct path
    path = []
    edge_ids = []
    current = end
    while current is not None:
        path.append(current)
        if previous_edge[current] is not None:
            edge_ids.append(previous_edge[current])
        current = previous[current]
    path.reverse()
    edge_ids.reverse()
    
    # Generate detailed steps
    steps = []
    total_weight = 0
    
    for i in range(len(path) - 1):
        from_id = path[i]
        to_id = path[i + 1]
        
        # Get the edge weight
        edge_weight = None
        if i < len(edge_ids):
            try:
                edge = NodeEdge.objects.get(id=edge_ids[i])
                edge_weight = edge.weight
                total_weight += edge_weight
            except NodeEdge.DoesNotExist:
                edge_weight = 1.0
        
        # Get step description
        description = get_step_description(from_id, to_id, edge_weight)
        
        steps.append({
            'from': from_id,
            'to': to_id,
            'description': description,
            'weight': edge_weight or 1.0
        })
    
    return {
        "found": True,
        "path": path,
        "edge_ids": edge_ids,
        "total_cost": distances[end],
        "steps": steps
    }