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

const CATEGORY_OPTIONS = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'appliances', label: 'Appliances' },
];

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

function ItemRow({ item, selected, isChecked, onToggleSelect, onDelete, disabled }) {
  const categoryColor = CATEGORY_COLORS[item.category?.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  return (
    <>
      <tr className={`border-b border-gray-800 transition-colors ${selected ? "bg-emerald-500/10" : isChecked ? "bg-blue-500/10" : "hover:bg-gray-800/30"}`}>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggleSelect(item.id)}
              disabled={disabled}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center gap-2">
              {selected && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
              {isChecked && !selected && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              <span className="font-medium text-white text-sm">{item.name}</span>
            </div>
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
          ) : isChecked ? (
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
              Chosen
            </span>
          ) : (
            <span className="text-xs text-gray-600">—</span>
          )}
        </td>
        <td className="px-5 py-4 text-center">
          {!disabled && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
              title="Delete item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </td>
      </tr>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <tr className="bg-red-900/20">
          <td colSpan="6" className="px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Delete <span className="text-white font-semibold">"{item.name}"</span>?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function AddItemModal({ isOpen, onClose, onAddItem, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'supplies',
    cost: '',
    utility_value: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    }
    if (!formData.utility_value || parseInt(formData.utility_value) < 1 || parseInt(formData.utility_value) > 100) {
      newErrors.utility_value = 'Utility must be between 1 and 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const itemData = {
      name: formData.name.trim(),
      category: formData.category,
      cost: parseFloat(formData.cost),
      utility_value: parseInt(formData.utility_value),
      description: formData.description.trim(),
    };

    await onAddItem(itemData);
    
    setFormData({
      name: '',
      category: 'supplies',
      cost: '',
      utility_value: '',
      description: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Add New Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              className={`w-full px-4 py-2 bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500`}
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-800/50 border ${errors.category ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              disabled={loading}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cost (NPR) *
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="Enter cost"
              min="0.01"
              step="0.01"
              className={`w-full px-4 py-2 bg-gray-800/50 border ${errors.cost ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500`}
              disabled={loading}
            />
            {errors.cost && <p className="mt-1 text-sm text-red-400">{errors.cost}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Utility Value (1-100) *
            </label>
            <input
              type="number"
              name="utility_value"
              value={formData.utility_value}
              onChange={handleChange}
              placeholder="Enter utility value"
              min="1"
              max="100"
              className={`w-full px-4 py-2 bg-gray-800/50 border ${errors.utility_value ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500`}
              disabled={loading}
            />
            {errors.utility_value && <p className="mt-1 text-sm text-red-400">{errors.utility_value}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
              rows="3"
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500 resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

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

  const addItem = async (itemData) => {
    setAddingItem(true);
    try {
      const response = await api.post('/inventory/items/create/', itemData);
      setItems(prev => [...prev, response.data]);
      showSuccess(`Item "${response.data.name}" added successfully!`, 'Success');
      setIsAddModalOpen(false);
      return response.data;
    } catch (err) {
      console.error('Error adding item:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add item';
      showError(errorMsg, 'Error');
      throw err;
    } finally {
      setAddingItem(false);
    }
  };

  const deleteItem = async (itemId) => {
    setDeletingItem(true);
    try {
      const item = items.find(i => i.id === itemId);
      await api.delete(`/inventory/items/${itemId}/`);
      setItems(prev => prev.filter(i => i.id !== itemId));
      // Remove from selected items if it was selected
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      showSuccess(`Item "${item?.name}" deleted successfully!`, 'Success');
    } catch (err) {
      console.error('Error deleting item:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete item';
      showError(errorMsg, 'Error');
    } finally {
      setDeletingItem(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setSelectedItems(newSet);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const selectAll = () => {
    const allIds = new Set(items.map(item => item.id));
    setSelectedItems(allIds);
  };

  const runOptimization = async () => {
    const b = parseFloat(budget);
    if (!b || b <= 0) {
      setError("Please enter a valid budget.");
      showError('Please enter a valid budget amount', 'Validation Error');
      return;
    }

    if (selectedItems.size === 0) {
      setError("Please select at least one item for procurement.");
      showError('Please select at least one item', 'Selection Required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = { 
        budget: b,
        selected_item_ids: Array.from(selectedItems)
      };
      const response = await api.post('/inventory/optimize/', payload);
      setResult(response.data);
      setTab("result");
      
      showSuccess(`Optimization complete! Selected ${response.data.items_selected} items out of ${response.data.items_considered} considered`, 'Success');
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

  const stats = {
    total: items.length,
    selected: selectedItems.size,
    optimized: result?.items_selected || 0,
    totalSelectedCost: items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + parseFloat(item.cost || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Optimizer</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manually select items, then run optimization to find the best combination within budget
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Items" 
          value={stats.total} 
          sub="Available in catalog"
        />
        <StatCard 
          label="Selected for Optimization" 
          value={stats.selected} 
          color={stats.selected > 0 ? "text-blue-400" : "text-white"}
          sub={stats.selected > 0 ? `${fmt(stats.totalSelectedCost)} total cost` : "None selected"}
        />
        <StatCard 
          label="Optimized Selection" 
          value={stats.optimized} 
          color={stats.optimized > 0 ? "text-emerald-400" : "text-white"}
          sub={result ? `${((result.total_cost / result.budget) * 100).toFixed(1)}% of budget used` : "Run optimization"}
        />
        <StatCard 
          label="Budget" 
          value={result ? fmt(result.budget) : "—"} 
          color="text-blue-400"
          sub={result ? `Remaining: ${fmt(result.budget_remaining)}` : "Set budget below"}
        />
      </div>

      {/* Budget Input */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Step 1: Set Budget & Select Items</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Enter budget amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runOptimization()}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                         placeholder-gray-500 text-sm"
            />
          </div>
          <button
            onClick={runOptimization}
            disabled={loading || !budget || selectedItems.size === 0}
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
              "Run Optimization"
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          {selectedItems.size === 0 
            ? "📌 Select items from the table below using the checkboxes, then run optimization"
            : `📌 ${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''} selected. The algorithm will find the best combination within your budget.`}
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
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Items Considered</span>
            <p className="font-mono font-semibold text-cyan-400 mt-0.5">{result.items_considered}</p>
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
               All Items ({items.length})
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
               Optimized ({result?.items_selected || 0})
            </button>
          </div>
          <div className="flex items-center gap-2">
            {selectedItems.size > 0 && (
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                📌 {selectedItems.size} selected
              </span>
            )}
            {result && tab === "result" && (
              <button
                onClick={() => setTab("catalog")}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
              >
                ← Back to selection
              </button>
            )}
          </div>
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
              Click the <span className="text-emerald-400">"Add Item"</span> button to create your first item
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-4 text-left">Select</th>
                  <th className="px-5 py-4 text-left">Item</th>
                  <th className="px-5 py-4 text-left">Category</th>
                  <th className="px-5 py-4 text-left">Cost</th>
                  <th className="px-5 py-4 text-left">Utility</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayItems.map((item) => (
                  <ItemRow 
                    key={item.id} 
                    item={item} 
                    selected={selectedIds.has(item.id)}
                    isChecked={selectedItems.has(item.id)}
                    onToggleSelect={toggleItemSelection}
                    onDelete={deleteItem}
                    disabled={tab === "result" || deletingItem}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={addItem}
        loading={addingItem}
      />
    </div>
  );
}