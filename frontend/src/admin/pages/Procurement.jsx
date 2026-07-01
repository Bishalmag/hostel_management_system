// src/admin/pages/Procurement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

// ── Config ────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  furniture:   { bg: 'rgba(245, 166, 35, 0.2)', text: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
  electronics: { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
  supplies:    { bg: 'rgba(29, 219, 168, 0.2)', text: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
  maintenance: { bg: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
  kitchen:     { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  appliances:  { bg: 'rgba(99, 102, 241, 0.2)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.3)' },
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
function StatCard({ label, value, sub, color = "#eaf2ff" }) {
  return (
    <div style={{
      background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
      border: '1px solid #1a3050',
      borderRadius: '12px',
      padding: '16px',
    }}>
      <p style={{
        color: '#6b8aaa',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: 0,
      }}>{label}</p>
      <p style={{
        fontSize: '24px',
        fontWeight: 700,
        color: color,
        margin: '4px 0 0 0',
      }}>{value}</p>
      {sub && <p style={{
        fontSize: '12px',
        color: '#3a5070',
        marginTop: '4px',
        marginBottom: 0,
      }}>{sub}</p>}
    </div>
  );
}

function ItemRow({ item, selected, isChecked, onToggleSelect, onDelete, disabled }) {
  const categoryColor = CATEGORY_COLORS[item.category?.toLowerCase()] || { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  return (
    <>
      <tr style={{
        borderBottom: '1px solid #1a3050',
        transition: 'background 0.2s ease',
        background: selected ? 'rgba(29, 219, 168, 0.1)' : isChecked ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!selected && !isChecked) {
          e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && !isChecked) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
      >
        <td style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggleSelect(item.id)}
              disabled={disabled}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: '1px solid #1a3050',
                background: '#0f2040',
                accentColor: '#f5a623',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selected && <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#1ddba8',
                flexShrink: 0,
              }} />}
              {isChecked && !selected && <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#60a5fa',
                flexShrink: 0,
              }} />}
              <span style={{
                fontWeight: 500,
                color: '#eaf2ff',
                fontSize: '14px',
              }}>{item.name}</span>
            </div>
          </div>
        </td>
        <td style={{ padding: '16px 20px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            border: `1px solid ${categoryColor.border}`,
            background: categoryColor.bg,
            color: categoryColor.text,
          }}>
            {item.category || "Uncategorized"}
          </span>
        </td>
        <td style={{ padding: '16px 20px', fontSize: '14px', color: '#c8daf0', fontFamily: 'monospace' }}>
          {fmt(item.cost)}
        </td>
        <td style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: 1,
              background: '#1a3050',
              borderRadius: '4px',
              height: '6px',
              width: '64px',
            }}>
              <div style={{
                height: '6px',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
                background: '#f5a623',
                width: `${Math.min(item.utility_value, 100)}%`,
              }} />
            </div>
            <span style={{
              fontSize: '12px',
              color: '#6b8aaa',
              width: '24px',
            }}>{item.utility_value}</span>
          </div>
        </td>
        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
          {selected ? (
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#1ddba8',
              background: 'rgba(29, 219, 168, 0.2)',
              padding: '2px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(29, 219, 168, 0.3)',
            }}>
              Selected
            </span>
          ) : isChecked ? (
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#60a5fa',
              background: 'rgba(96, 165, 250, 0.2)',
              padding: '2px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}>
              Chosen
            </span>
          ) : (
            <span style={{ fontSize: '12px', color: '#3a5070' }}>—</span>
          )}
        </td>
        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
          {!disabled && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                color: '#f87171',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
                e.currentTarget.style.color = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#f87171';
              }}
              title="Delete item"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </td>
      </tr>
      
      {/* Delete Confirmation Row */}
      {showDeleteConfirm && (
        <tr style={{ background: 'rgba(248, 113, 113, 0.1)' }}>
          <td colSpan="6" style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#c8daf0' }}>
                Delete <span style={{ color: '#eaf2ff', fontWeight: 600 }}>"{item.name}"</span>?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '4px 12px',
                    background: '#0f2040',
                    color: '#eaf2ff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#122448';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0f2040';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setShowDeleteConfirm(false);
                  }}
                  style={{
                    padding: '4px 12px',
                    background: '#f87171',
                    color: '#0a1628',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f87171';
                  }}
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '448px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #1a3050',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Add New Item</h2>
          <button
            onClick={onClose}
            style={{
              color: '#6b8aaa',
              background: 'transparent',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'color 0.3s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.color = '#eaf2ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b8aaa';
            }}
            disabled={loading}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#c8daf0',
              marginBottom: '4px',
            }}>
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(15, 32, 64, 0.5)',
                border: `1px solid ${errors.name ? '#f87171' : '#1a3050'}`,
                borderRadius: '8px',
                color: '#eaf2ff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                placeholder: { color: '#3a5070' },
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 166, 35, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.name ? '#f87171' : '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
            {errors.name && <p style={{ marginTop: '4px', fontSize: '14px', color: '#f87171' }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#c8daf0',
              marginBottom: '4px',
            }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(15, 32, 64, 0.5)',
                border: `1px solid ${errors.category ? '#f87171' : '#1a3050'}`,
                borderRadius: '8px',
                color: '#eaf2ff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 166, 35, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.category ? '#f87171' : '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.category && <p style={{ marginTop: '4px', fontSize: '14px', color: '#f87171' }}>{errors.category}</p>}
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#c8daf0',
              marginBottom: '4px',
            }}>
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
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(15, 32, 64, 0.5)',
                border: `1px solid ${errors.cost ? '#f87171' : '#1a3050'}`,
                borderRadius: '8px',
                color: '#eaf2ff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                placeholder: { color: '#3a5070' },
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 166, 35, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.cost ? '#f87171' : '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
            {errors.cost && <p style={{ marginTop: '4px', fontSize: '14px', color: '#f87171' }}>{errors.cost}</p>}
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#c8daf0',
              marginBottom: '4px',
            }}>
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
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(15, 32, 64, 0.5)',
                border: `1px solid ${errors.utility_value ? '#f87171' : '#1a3050'}`,
                borderRadius: '8px',
                color: '#eaf2ff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                placeholder: { color: '#3a5070' },
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 166, 35, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.utility_value ? '#f87171' : '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
            {errors.utility_value && <p style={{ marginTop: '4px', fontSize: '14px', color: '#f87171' }}>{errors.utility_value}</p>}
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#c8daf0',
              marginBottom: '4px',
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
              rows="3"
              style={{
                width: '100%',
                padding: '8px 16px',
                background: 'rgba(15, 32, 64, 0.5)',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                outline: 'none',
                transition: 'all 0.3s ease',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                placeholder: { color: '#3a5070' },
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 166, 35, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #1a3050',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#0f2040',
                color: '#eaf2ff',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#122448';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0f2040';
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: loading ? 'rgba(245, 166, 35, 0.5)' : '#f5a623',
                color: '#0a1628',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#e09515';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#f5a623';
              }}
            >
              {loading ? (
                <>
                  <svg style={{
                    width: '16px',
                    height: '16px',
                    animation: 'spin 1s linear infinite',
                  }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Procurement Optimizer</h1>
          <p style={{
            fontSize: '14px',
            color: '#6b8aaa',
            marginTop: '4px',
            marginBottom: 0,
          }}>
            Manually select items, then run optimization to find the best combination within budget
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '8px 16px',
              background: '#1ddba8',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#16c39a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1ddba8';
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
          <button
            onClick={selectAll}
            style={{
              padding: '8px 16px',
              background: '#60a5fa',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#60a5fa';
            }}
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            style={{
              padding: '8px 16px',
              background: '#0f2040',
              color: '#eaf2ff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#122448';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0f2040';
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        <StatCard 
          label="Total Items" 
          value={stats.total} 
          sub="Available in catalog"
        />
        <StatCard 
          label="Selected for Optimization" 
          value={stats.selected} 
          color={stats.selected > 0 ? "#60a5fa" : "#eaf2ff"}
          sub={stats.selected > 0 ? `${fmt(stats.totalSelectedCost)} total cost` : "None selected"}
        />
        <StatCard 
          label="Optimized Selection" 
          value={stats.optimized} 
          color={stats.optimized > 0 ? "#1ddba8" : "#eaf2ff"}
          sub={result ? `${((result.total_cost / result.budget) * 100).toFixed(1)}% of budget used` : "Run optimization"}
        />
        <StatCard 
          label="Budget" 
          value={result ? fmt(result.budget) : "—"} 
          color="#60a5fa"
          sub={result ? `Remaining: ${fmt(result.budget_remaining)}` : "Set budget below"}
        />
      </div>

      {/* Budget Input */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <h2 style={{
          color: '#eaf2ff',
          fontWeight: 600,
          marginBottom: '16px',
          fontSize: '16px',
          marginTop: 0,
        }}>Step 1: Set Budget & Select Items</h2>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="number"
              placeholder="Enter budget amount"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runOptimization()}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 32, 64, 0.5)',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontSize: '14px',
                placeholder: { color: '#3a5070' },
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f5a623';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 166, 35, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1a3050';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={runOptimization}
            disabled={loading || !budget || selectedItems.size === 0}
            style={{
              padding: '12px 24px',
              background: (!budget || selectedItems.size === 0 || loading) ? 'rgba(245, 166, 35, 0.5)' : '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: (!budget || selectedItems.size === 0 || loading) ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              opacity: (!budget || selectedItems.size === 0 || loading) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (budget && selectedItems.size > 0 && !loading) {
                e.currentTarget.style.background = '#e09515';
              }
            }}
            onMouseLeave={(e) => {
              if (budget && selectedItems.size > 0 && !loading) {
                e.currentTarget.style.background = '#f5a623';
              }
            }}
          >
            {loading ? (
              <>
                <svg style={{
                  width: '16px',
                  height: '16px',
                  animation: 'spin 1s linear infinite',
                }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Optimizing...
              </>
            ) : (
              "Run Optimization"
            )}
          </button>
        </div>

        {error && (
          <p style={{
            marginTop: '12px',
            fontSize: '14px',
            color: '#f87171',
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            borderRadius: '8px',
            padding: '8px 12px',
          }}>
            {error}
          </p>
        )}
        <p style={{
          fontSize: '12px',
          color: '#3a5070',
          marginTop: '12px',
          marginBottom: 0,
        }}>
          {selectedItems.size === 0 
            ? "◆ Select items from the table below using the checkboxes, then run optimization"
            : `◆ ${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''} selected. The algorithm will find the best combination within your budget.`}
        </p>
      </div>

      {/* Algorithm Info */}
      {result && (
        <div style={{
          background: 'rgba(15, 32, 64, 0.5)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          fontSize: '14px',
        }}>
          <div>
            <span style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Algorithm</span>
            <p style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#eaf2ff',
              marginTop: '2px',
              marginBottom: 0,
            }}>0/1 Knapsack (DP)</p>
          </div>
          <div>
            <span style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>DP Table Size</span>
            <p style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#eaf2ff',
              marginTop: '2px',
              marginBottom: 0,
            }}>{result.dp_table_size}</p>
          </div>
          <div>
            <span style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Complexity</span>
            <p style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#eaf2ff',
              marginTop: '2px',
              marginBottom: 0,
            }}>O(n × W)</p>
          </div>
          <div>
            <span style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Session</span>
            <p style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#eaf2ff',
              marginTop: '2px',
              marginBottom: 0,
            }}>#{result.session_id}</p>
          </div>
          <div>
            <span style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Budget Remaining</span>
            <p style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#1ddba8',
              marginTop: '2px',
              marginBottom: 0,
            }}>{fmt(result.budget_remaining)}</p>
          </div>
          <div>
            <span style={{
              color: '#6b8aaa',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Items Considered</span>
            <p style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: '#f5a623',
              marginTop: '2px',
              marginBottom: 0,
            }}>{result.items_considered}</p>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          borderBottom: '1px solid #1a3050',
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setTab("catalog")}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: tab === "catalog" ? 'rgba(245, 166, 35, 0.2)' : 'transparent',
                color: tab === "catalog" ? '#f5a623' : '#6b8aaa',
                border: tab === "catalog" ? '1px solid rgba(245, 166, 35, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (tab !== "catalog") e.currentTarget.style.color = '#c8daf0';
              }}
              onMouseLeave={(e) => {
                if (tab !== "catalog") e.currentTarget.style.color = '#6b8aaa';
              }}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setTab("result")}
              disabled={!result}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: !result ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: tab === "result" ? 'rgba(245, 166, 35, 0.2)' : 'transparent',
                color: !result ? '#3a5070' : tab === "result" ? '#f5a623' : '#6b8aaa',
                border: tab === "result" ? '1px solid rgba(245, 166, 35, 0.3)' : 'none',
                opacity: !result ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (result && tab !== "result") e.currentTarget.style.color = '#c8daf0';
              }}
              onMouseLeave={(e) => {
                if (result && tab !== "result") e.currentTarget.style.color = '#6b8aaa';
              }}
            >
              Optimized ({result?.items_selected || 0})
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedItems.size > 0 && (
              <span style={{
                fontSize: '12px',
                color: '#60a5fa',
                background: 'rgba(96, 165, 250, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(96, 165, 250, 0.2)',
              }}>
                ◆ {selectedItems.size} selected
              </span>
            )}
            {result && tab === "result" && (
              <button
                onClick={() => setTab("catalog")}
                style={{
                  fontSize: '14px',
                  color: '#f5a623',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#e09515';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#f5a623';
                }}
              >
                ← Back to selection
              </button>
            )}
          </div>
        </div>

        {fetching ? (
          <div style={{
            textAlign: 'center',
            color: '#6b8aaa',
            padding: '48px 0',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #1a3050',
              borderTop: '3px solid #f5a623',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            Loading items...
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>◇</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#eaf2ff',
              marginBottom: '8px',
            }}>No Items in Catalog</h3>
            <p style={{
              color: '#6b8aaa',
              fontSize: '14px',
            }}>
              Click the <span style={{ color: '#1ddba8' }}>"Add Item"</span> button to create your first item
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              fontSize: '14px',
              borderCollapse: 'collapse',
            }}>
              <thead style={{
                background: 'rgba(15, 32, 64, 0.5)',
                borderBottom: '1px solid #1a3050',
              }}>
                <tr style={{
                  color: '#6b8aaa',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Select</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Cost</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Utility</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
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

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}