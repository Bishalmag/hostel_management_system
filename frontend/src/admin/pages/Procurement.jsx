// src/admin/pages/Procurement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

// ── Config ────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  furniture:   "bg-amber-500/20 text-amber-400 border-amber-500/30",
  electronics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  supplies:    "bg-green-500/20 text-green-400 border-green-500/30",
  maintenance: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  kitchen:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  appliances:  "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function ItemRow({ item, selected }) {
  const categoryColor = CATEGORY_COLORS[item.category?.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  
  return (
    <tr className={`border-b border-gray-800 transition-colors ${selected ? "bg-emerald-500/10" : "hover:bg-gray-800/30"}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {selected && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
          <span className="font-medium text-white text-sm">{item.name}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColor}`}>
          {item.category || "Uncategorized"}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-gray-300 font-mono">{fmt(item.cost)}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-1.5 w-16">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${Math.min(item.utility_value, 100)}%` }} 
            />
          </div>
          <span className="text-xs text-gray-400 w-6">{item.utility_value}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-center">
        {selected ? (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
             Selected
          </span>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </td>
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Procurement() {
  const { showSuccess, showError } = useNotification();
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("catalog");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setFetching(true);
      setError(null);
      const response = await api.get('/inventory/items/');
      setItems(response.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      if (err.response?.status === 401) {
        setError('Please login to access procurement');
      } else {
        setError('Failed to load items');
        showError('Failed to load inventory items', 'Error');
      }
    } finally {
      setFetching(false);
    }
  };

  const runOptimization = async () => {
    const b = parseFloat(budget);
    if (!b || b <= 0) {
      setError("Please enter a valid budget.");
      showError('Please enter a valid budget amount', 'Validation Error');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/inventory/optimize/', { budget: b });
      setResult(response.data);
      setTab("result");
      showSuccess(`Optimization complete! Selected ${response.data.items_selected} items`, 'Success');
    } catch (err) {
      console.error('Optimization failed:', err);
      const errorMsg = err.response?.data?.error || 'Optimization failed';
      setError(errorMsg);
      showError(errorMsg, 'Optimization Error');
    } finally {
      setLoading(false);
    }
  };

  const selectedIds = new Set(result?.selected_items?.map((i) => i.id) ?? []);
  const displayItems = tab === "result" && result ? result.selected_items : items;

  // Stats
  const stats = {
    total: items.length,
    selected: result?.items_selected || 0,
    totalValue: items.reduce((sum, item) => sum + item.cost, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Optimizer</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Items" 
          value={stats.total} 
          sub={`${fmt(stats.totalValue)} total value`}
        />
        <StatCard 
          label="Items Selected" 
          value={stats.selected} 
          color={stats.selected > 0 ? "text-emerald-400" : "text-white"}
        />
        <StatCard 
          label="Budget" 
          value={result ? fmt(result.budget) : "—"} 
          color="text-blue-400"
        />
        <StatCard 
          label="Total Utility" 
          value={result ? result.total_utility : "—"} 
          color="text-purple-400"
          sub={result ? `${((result.total_cost / result.budget) * 100).toFixed(1)}% used` : undefined}
        />
      </div>

      {/* Budget Input */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Set Budget & Optimize</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              NPR
            </span> */}
            <input
              type="number"
              placeholder="Enter budget amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runOptimization()}
              className="w-full pl-14 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                         placeholder-gray-500 text-sm"
            />
          </div>
          <button
            onClick={runOptimization}
            disabled={loading || !budget}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50
                       text-black font-semibold rounded-lg transition-colors text-sm
                       flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Optimizing...
              </>
            ) : (
              "Optimize"
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Selects the best combination from {items.length} items to maximize utility without exceeding budget.
        </p>
      </div>

      {/* Algorithm Info */}
      {result && (
        <div className="bg-slate-800/50 border border-gray-700 rounded-xl px-6 py-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Algorithm</span>
            <p className="font-mono font-semibold text-white mt-0.5">0/1 Knapsack (DP)</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">DP Table Size</span>
            <p className="font-mono font-semibold text-white mt-0.5">{result.dp_table_size}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Complexity</span>
            <p className="font-mono font-semibold text-white mt-0.5">O(n × W)</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Session</span>
            <p className="font-mono font-semibold text-white mt-0.5">#{result.session_id}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Budget Remaining</span>
            <p className="font-mono font-semibold text-emerald-400 mt-0.5">{fmt(result.budget_remaining)}</p>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTab("catalog")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === "catalog"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
               Catalog ({items.length})
            </button>
            <button
              onClick={() => setTab("result")}
              disabled={!result}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                !result
                  ? "text-gray-600 cursor-not-allowed"
                  : tab === "result"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
               Selected ({result?.items_selected || 0})
            </button>
          </div>
          {result && tab === "result" && (
            <button
              onClick={() => setTab("catalog")}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
            >
              ← Back to catalog
            </button>
          )}
        </div>

        {fetching ? (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            Loading items...
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Items in Catalog</h3>
            <p className="text-gray-400 text-sm">
              Run <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">python manage.py seed_inventory</code>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">Item</th>
                  <th className="px-5 py-4 text-left">Category</th>
                  <th className="px-5 py-4 text-left">Cost</th>
                  <th className="px-5 py-4 text-left">Utility</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayItems.map((item) => (
                  <ItemRow key={item.id} item={item} selected={selectedIds.has(item.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}