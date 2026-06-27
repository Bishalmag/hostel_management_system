import React, { useState, useEffect } from 'react';
import {
  getNodes, createNode, updateNode, deleteNode,
  getEdges, createEdge, updateEdge, deleteEdge,
} from '../../api/navigationApi';

const NODE_TYPES = ['entrance', 'block', 'floor', 'room', 'common'];

const EMPTY_NODE = { name: '', node_type: 'entrance', block: '', floor: '', room: '' };
const EMPTY_EDGE = { from_node: '', to_node: '', weight: 1, bidirectional: true };

const TYPE_COLORS = {
  entrance: 'bg-indigo-500/20 text-indigo-400',
  block:    'bg-sky-500/20 text-sky-400',
  floor:    'bg-emerald-500/20 text-emerald-400',
  room:     'bg-yellow-500/20 text-yellow-400',
  common:   'bg-purple-500/20 text-purple-400',
};

export default function NavigationManager() {
  const [nodes,      setNodes]      = useState([]);
  const [edges,      setEdges]      = useState([]);
  const [tab,        setTab]        = useState('nodes');
  const [nodeForm,   setNodeForm]   = useState(EMPTY_NODE);
  const [edgeForm,   setEdgeForm]   = useState(EMPTY_EDGE);
  const [editNodeId, setEditNodeId] = useState(null);
  const [editEdgeId, setEditEdgeId] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null); // {msg, type}

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const [n, e] = await Promise.all([getNodes(), getEdges()]);
      setNodes(n.data.results ?? n.data);
      setEdges(e.data.results ?? e.data);
    } catch (err) {
      flash('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }

  function flash(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── NODE ──
  function startEditNode(n) {
    setEditNodeId(n.id);
    setNodeForm({
      name: n.name, node_type: n.node_type,
      block: n.block ?? '', floor: n.floor ?? '', room: n.room ?? '',
    });
    setTab('nodes');
    window.scrollTo(0, 0);
  }

  function cancelNode() { setEditNodeId(null); setNodeForm(EMPTY_NODE); }

  async function handleNodeSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...nodeForm };
    if (!payload.block) delete payload.block;
    if (!payload.floor) delete payload.floor;
    if (!payload.room)  delete payload.room;
    try {
      if (editNodeId) {
        await updateNode(editNodeId, payload);
        flash('Node updated');
      } else {
        await createNode(payload);
        flash('Node created');
      }
      cancelNode();
      load();
    } catch (err) {
      flash(err.response?.data?.detail ?? JSON.stringify(err.response?.data) ?? 'Error saving node', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNode(id) {
    if (!window.confirm('Delete this node? All edges connected to it will also be deleted.')) return;
    try {
      await deleteNode(id);
      flash('Node deleted');
      load();
    } catch {
      flash('Failed to delete node', 'error');
    }
  }

  // ── EDGE ──
  function startEditEdge(edge) {
    setEditEdgeId(edge.id);
    setEdgeForm({
      from_node: edge.from_node, to_node: edge.to_node,
      weight: edge.weight, bidirectional: edge.bidirectional,
    });
    setTab('edges');
    window.scrollTo(0, 0);
  }

  function cancelEdge() { setEditEdgeId(null); setEdgeForm(EMPTY_EDGE); }

  async function handleEdgeSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...edgeForm, weight: parseFloat(edgeForm.weight) };
    try {
      if (editEdgeId) {
        await updateEdge(editEdgeId, payload);
        flash('Edge updated');
      } else {
        await createEdge(payload);
        flash('Edge created');
      }
      cancelEdge();
      load();
    } catch (err) {
      flash(err.response?.data?.detail ?? JSON.stringify(err.response?.data) ?? 'Error saving edge', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEdge(id) {
    if (!window.confirm('Delete this edge?')) return;
    try {
      await deleteEdge(id);
      flash('Edge deleted');
      load();
    } catch {
      flash('Failed to delete edge', 'error');
    }
  }

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n.name]));

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Navigation Manager</h1>
      <div className="text-center text-gray-400 py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
        Loading...
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Navigation Manager</h1>
          <p className="text-gray-400 text-sm mt-1">
            Build the hostel map: add nodes (locations) then connect them with edges.
          </p>
        </div>
        <button onClick={load}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition">
          Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Nodes</p>
          <p className="text-3xl font-bold text-white mt-1">{nodes.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Edges</p>
          <p className="text-3xl font-bold text-white mt-1">{edges.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-800">
        {[
          { key: 'nodes', label: `Nodes (${nodes.length})` },
          { key: 'edges', label: `Edges (${edges.length})` },
        ].map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); cancelNode(); cancelEdge(); }}
            className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
              tab === t.key
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 hover:text-gray-300 border-transparent'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ NODES TAB ═══ */}
      {tab === 'nodes' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              {editNodeId ? '✏️ Edit Node' : '➕ Add Node'}
            </h2>
            <form onSubmit={handleNodeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Node Name *
                  </label>
                  <input required
                    placeholder="e.g. Block A Entrance"
                    value={nodeForm.name}
                    onChange={e => setNodeForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Node Type *
                  </label>
                  <select
                    value={nodeForm.node_type}
                    onChange={e => setNodeForm(f => ({ ...f, node_type: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition">
                    {NODE_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Block ID <span className="text-gray-600">(optional — link to existing block)</span>
                  </label>
                  <input type="number"
                    placeholder="Leave blank if not applicable"
                    value={nodeForm.block}
                    onChange={e => setNodeForm(f => ({ ...f, block: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Floor ID <span className="text-gray-600">(optional)</span>
                  </label>
                  <input type="number"
                    placeholder="Leave blank if not applicable"
                    value={nodeForm.floor}
                    onChange={e => setNodeForm(f => ({ ...f, floor: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Room ID <span className="text-gray-600">(optional)</span>
                  </label>
                  <input type="number"
                    placeholder="Leave blank if not applicable"
                    value={nodeForm.room}
                    onChange={e => setNodeForm(f => ({ ...f, room: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {saving ? 'Saving...' : editNodeId ? 'Update Node' : 'Add Node'}
                </button>
                {editNodeId && (
                  <button type="button" onClick={cancelNode}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Node table */}
          {nodes.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-3">🗺️</div>
              <h3 className="text-white font-semibold mb-1">No nodes yet</h3>
              <p className="text-gray-400 text-sm">Add your first location node above.</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50 border-b border-gray-800">
                    <tr className="text-gray-500 text-xs uppercase tracking-wide">
                      {['ID', 'Name', 'Type', 'Block', 'Floor', 'Room', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {nodes.map(n => (
                      <tr key={n.id}
                        className={`hover:bg-gray-800/30 transition ${editNodeId === n.id ? 'bg-purple-500/5' : ''}`}>
                        <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{n.id}</td>
                        <td className="px-5 py-4 text-white font-medium">{n.name}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[n.node_type] ?? 'bg-gray-500/20 text-gray-400'}`}>
                            {n.node_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400">{n.block ?? '—'}</td>
                        <td className="px-5 py-4 text-gray-400">{n.floor ?? '—'}</td>
                        <td className="px-5 py-4 text-gray-400">{n.room  ?? '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => startEditNode(n)}
                              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium rounded-lg transition">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteNode(n.id)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ EDGES TAB ═══ */}
      {tab === 'edges' && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              {editEdgeId ? '✏️ Edit Edge' : '➕ Add Edge'}
            </h2>
            {nodes.length < 2 && (
              <div className="mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                ⚠️ Add at least 2 nodes first before creating edges.
              </div>
            )}
            <form onSubmit={handleEdgeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    From Node *
                  </label>
                  <select required
                    value={edgeForm.from_node}
                    onChange={e => setEdgeForm(f => ({ ...f, from_node: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition">
                    <option value="">Select node...</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    To Node *
                  </label>
                  <select required
                    value={edgeForm.to_node}
                    onChange={e => setEdgeForm(f => ({ ...f, to_node: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition">
                    <option value="">Select node...</option>
                    {nodes.filter(n => n.id !== parseInt(edgeForm.from_node))
                          .map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Weight (distance / time)
                  </label>
                  <input type="number" min="0.1" step="0.1"
                    value={edgeForm.weight}
                    onChange={e => setEdgeForm(f => ({ ...f, weight: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox"
                  checked={edgeForm.bidirectional}
                  onChange={e => setEdgeForm(f => ({ ...f, bidirectional: e.target.checked }))}
                  className="w-4 h-4 accent-purple-500" />
                <span className="text-sm text-gray-300">
                  Bidirectional <span className="text-gray-500">(A ↔ B — uncheck for one-way A → B only)</span>
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || nodes.length < 2}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {saving ? 'Saving...' : editEdgeId ? 'Update Edge' : 'Add Edge'}
                </button>
                {editEdgeId && (
                  <button type="button" onClick={cancelEdge}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Edge table */}
          {edges.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-3">🔗</div>
              <h3 className="text-white font-semibold mb-1">No edges yet</h3>
              <p className="text-gray-400 text-sm">Connect your nodes with edges above.</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50 border-b border-gray-800">
                    <tr className="text-gray-500 text-xs uppercase tracking-wide">
                      {['ID', 'From', '', 'To', 'Weight', 'Bidir', 'Actions'].map((h, i) => (
                        <th key={i} className="px-5 py-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {edges.map(e => (
                      <tr key={e.id}
                        className={`hover:bg-gray-800/30 transition ${editEdgeId === e.id ? 'bg-purple-500/5' : ''}`}>
                        <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{e.id}</td>
                        <td className="px-5 py-4 text-white font-medium">
                          {e.from_node_name ?? nodeMap[e.from_node]}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {e.bidirectional ? '↔' : '→'}
                        </td>
                        <td className="px-5 py-4 text-white font-medium">
                          {e.to_node_name ?? nodeMap[e.to_node]}
                        </td>
                        <td className="px-5 py-4 text-gray-300">{e.weight}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            e.bidirectional
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {e.bidirectional ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => startEditEdge(e)}
                              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium rounded-lg transition">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteEdge(e.id)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}