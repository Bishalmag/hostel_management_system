"""
0/1 Knapsack Algorithm for Procurement Optimization
Time Complexity: O(n × W)
"""

def knapsack_optimize(items: list, budget: float) -> dict:
    """
    Args:
        items: list of dicts { 'id', 'name', 'cost', 'utility_value', 'category' }
        budget: float — total available budget

    Returns:
        dict with selected_item_ids, total_cost, total_utility,
             budget_remaining, dp_table_size
    """
    if not items or budget <= 0:
        return {
            'selected_item_ids': [],
            'total_cost': 0,
            'total_utility': 0,
            'budget': float(budget),
            'budget_remaining': float(budget),
            'dp_table_size': '0x0',
        }

    SCALE = 100  # handle 2 decimal places
    W = int(budget * SCALE)
    n = len(items)

    costs = [int(round(float(item['cost']) * SCALE)) for item in items]
    values = [int(item['utility_value']) for item in items]

    # Build DP table
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        ci = costs[i - 1]
        vi = values[i - 1]
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if ci <= w:
                take = dp[i - 1][w - ci] + vi
                if take > dp[i][w]:
                    dp[i][w] = take

    # Backtrack to find selected items
    selected_ids = []
    w = W
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected_ids.append(items[i - 1]['id'])
            w -= costs[i - 1]

    # Calculate total_cost - ensure it's a float
    total_cost = float(sum(
        item['cost'] for item in items if item['id'] in selected_ids
    ))

    return {
        'selected_item_ids': selected_ids,
        'total_cost': round(total_cost, 2),
        'total_utility': dp[n][W],
        'budget': float(budget),
        'budget_remaining': round(float(budget) - total_cost, 2),
        'dp_table_size': f'{n + 1} × {W + 1}',
    }