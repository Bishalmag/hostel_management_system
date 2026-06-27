import React, { useState, useEffect } from 'react';
import {
  getNodes, createNode, updateNode, deleteNode,
  getEdges, createEdge, updateEdge, deleteEdge,
} from '../../api/navigationApi';
import api from '../../api/axios';

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

const PURPOSE_COLORS = {
  residential: 'bg-green-500/20 text-green-400 border border-green-500/30',
  reception: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  office: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  lobby: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  DI_room: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  library: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  canteen: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  hall: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
};

export default function NavigationManager() {
  const [nodes,      setNodes]      = useState([]);
  const [edges,      setEdges]      = useState([]);
  const [rooms,      setRooms]      = useState([]);
  const [floors,     setFloors]     = useState([]);
  const [blocks,     setBlocks]     = useState([]);
  const [tab,        setTab]        = useState('nodes');
  const [nodeForm,   setNodeForm]   = useState(EMPTY_NODE);
  const [edgeForm,   setEdgeForm]   = useState(EMPTY_EDGE);
  const [editNodeId, setEditNodeId] = useState(null);
  const [editEdgeId, setEditEdgeId] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [syncing,    setSyncing]    = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const [n, e, r, f, b] = await Promise.all([
        getNodes(),
        getEdges(),
        api.get('/hostel/rooms/'),
        api.get('/hostel/floors/'),
        api.get('/hostel/blocks/'),
      ]);

      // Handle paginated or non-paginated responses
      const nodesData  = n.data.results ?? n.data;
      const edgesData  = e.data.results ?? e.data;
      const roomsData  = r.data.results ?? r.data;
      const floorsData = f.data.results ?? f.data;
      const blocksData = b.data.results ?? b.data;

      console.log('=== NAVIGATION DATA ===');
      console.log('Nodes:', nodesData);
      console.log('Nodes count:', nodesData?.length || 0);
      console.log('Edges:', edgesData);
      console.log('Edges count:', edgesData?.length || 0);
      console.log('Rooms:', roomsData);
      console.log('Rooms count:', roomsData?.length || 0);
      console.log('Floors count:', floorsData?.length || 0);
      console.log('Blocks count:', blocksData?.length || 0);

      // Ensure we have arrays
      setNodes(Array.isArray(nodesData) ? nodesData : []);
      setEdges(Array.isArray(edgesData) ? edgesData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setFloors(Array.isArray(floorsData) ? floorsData : []);
      setBlocks(Array.isArray(blocksData) ? blocksData : []);
    } catch (err) {
      console.error('Load error:', err);
      flash('Failed to load data: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  function flash(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── SYNC ALL ROOMS TO NODES ──
  async function syncRoomsToNodes() {
    if (rooms.length === 0) {
      flash('No rooms found to sync. Please add rooms first.', 'error');
      return;
    }
    
    setSyncing(true);
    let created = 0;
    let skipped = 0;
    let errors = 0;
    const createdRooms = [];

    try {
      const allRooms = rooms;
      console.log(`Starting sync for ${allRooms.length} rooms...`);

      for (const room of allRooms) {
        try {
          // Check if node already exists for this room
          const existingNode = nodes.find(node => node.room === room.id);
          
          if (!existingNode) {
            // Create node name based on room purpose
            let nodeName;
            if (room.room_purpose === 'residential') {
              nodeName = `Room ${room.room_number}`;
            } else if (room.room_purpose) {
              const purposeDisplay = room.room_purpose.charAt(0).toUpperCase() + room.room_purpose.slice(1);
              // Handle DI_room special case
              const displayName = room.room_purpose === 'DI_room' ? 'DI Room' : purposeDisplay;
              nodeName = `${displayName} - ${room.room_number}`;
            } else {
              nodeName = `Room ${room.room_number}`;
            }
            
            const nodeData = {
              name: nodeName,
              node_type: 'room',
              block: room.block || null,
              floor: room.floor || null,
              room: room.id
            };
            
            console.log(`Creating node for room ${room.room_number} (${room.room_purpose}):`, nodeData);
            await createNode(nodeData);
            created++;
            createdRooms.push(`${room.room_number} (${room.room_purpose})`);
          } else {
            skipped++;
          }
        } catch (err) {
          console.error(`Error syncing room ${room.room_number}:`, err);
          errors++;
        }
      }

      const message = `✅ Synced ${created} rooms (${skipped} already exist, ${errors} errors)`;
      if (createdRooms.length > 0) {
        flash(`${message}\nCreated: ${createdRooms.join(', ')}`, 'success');
      } else {
        flash(message, 'success');
      }
      await load(); // Reload data
    } catch (err) {
      console.error('Sync error:', err);
      flash('Failed to sync rooms: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSyncing(false);
    }
  }

  // ── AUTO CREATE EDGES ──
  // 1. same-floor chain (original logic)
  // 2. cross-floor bridge: link representative node of floor N to floor N+1 (same block)
  // 3. cross-block bridge: link ground-floor representative node of each block to the next block
  async function autoCreateEdges() {
    if (nodes.length < 2) {
      flash('Need at least 2 nodes to create edges. Sync rooms first.', 'error');
      return;
    }

    setSyncing(true);
    let created = 0;
    let skipped = 0;
    let errors = 0;

    try {
      const existingEdges = edges.map(e => ({
        from: e.from_node,
        to: e.to_node
      }));

      const tryCreate = async (fromNode, toNode, weight = 1.0) => {
        if (!fromNode || !toNode || fromNode.id === toNode.id) return;
        const edgeExists = existingEdges.some(
          e => (e.from === fromNode.id && e.to === toNode.id) ||
               (e.from === toNode.id && e.to === fromNode.id)
        );
        if (edgeExists) { skipped++; return; }
        try {
          const edgeData = {
            from_node: fromNode.id,
            to_node: toNode.id,
            weight,
            bidirectional: true
          };
          console.log(`Creating edge: ${fromNode.name} ↔ ${toNode.name} (w=${weight})`);
          await createEdge(edgeData);
          created++;
          existingEdges.push({ from: fromNode.id, to: toNode.id });
        } catch (err) {
          console.error('Error creating edge:', err);
          errors++;
        }
      };

      // ── 1. SAME-FLOOR CHAIN ──
      const nodesByFloor = {};
      nodes.forEach(node => {
        if (node.floor) {
          if (!nodesByFloor[node.floor]) {
            nodesByFloor[node.floor] = [];
          }
          nodesByFloor[node.floor].push(node);
        }
      });

      console.log('Nodes by floor:', nodesByFloor);

      for (const floorId in nodesByFloor) {
        const floorNodes = [...nodesByFloor[floorId]].sort((a, b) => a.name.localeCompare(b.name));

        for (let i = 0; i < floorNodes.length - 1; i++) {
          await tryCreate(floorNodes[i], floorNodes[i + 1], 1.0);
        }
      }

      // ── 2. CROSS-FLOOR BRIDGE (same block, consecutive floor_number) ──
      // pick one representative node per floor = first node alphabetically
      const repByFloor = {};
      for (const floorId in nodesByFloor) {
        const sorted = [...nodesByFloor[floorId]].sort((a, b) => a.name.localeCompare(b.name));
        repByFloor[floorId] = sorted[0];
      }

      const floorsByBlock = {};
      floors.forEach(fl => {
        if (!floorsByBlock[fl.block]) floorsByBlock[fl.block] = [];
        floorsByBlock[fl.block].push(fl);
      });

      for (const blockId in floorsByBlock) {
        const sortedFloors = [...floorsByBlock[blockId]].sort((a, b) => a.floor_number - b.floor_number);
        for (let i = 0; i < sortedFloors.length - 1; i++) {
          const repA = repByFloor[sortedFloors[i].id];
          const repB = repByFloor[sortedFloors[i + 1].id];
          await tryCreate(repA, repB, 2.0); // stairs/lift weight, a bit higher than same-floor walk
        }
      }

      // ── 3. CROSS-BLOCK BRIDGE (ground floor of each block to the next block) ──
      const groundFloorRepByBlock = {};
      for (const blockId in floorsByBlock) {
        const sortedFloors = [...floorsByBlock[blockId]].sort((a, b) => a.floor_number - b.floor_number);
        const groundFloor = sortedFloors[0];
        if (groundFloor) groundFloorRepByBlock[blockId] = repByFloor[groundFloor.id];
      }

      const sortedBlocks = [...blocks].sort((a, b) => a.id - b.id);
      for (let i = 0; i < sortedBlocks.length - 1; i++) {
        const repA = groundFloorRepByBlock[sortedBlocks[i].id];
        const repB = groundFloorRepByBlock[sortedBlocks[i + 1].id];
        await tryCreate(repA, repB, 3.0); // outdoor walk weight, higher again
      }

      flash(`✅ Created ${created} edges (${skipped} already exist, ${errors} errors)`, 'success');
      await load();
    } catch (err) {
      console.error('Auto-create edges error:', err);
      flash('Failed to auto-create edges: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSyncing(false);
    }
  }

  // ── DELETE ALL ──
  async function deleteAllData() {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL nodes and edges? This cannot be undone!')) return;
    if (!window.confirm('⚠️ Really? This will delete ALL navigation data!')) return;
    
    setSyncing(true);
    let deletedNodes = 0;
    let deletedEdges = 0;
    let errors = 0;

    try {
      for (const edge of edges) {
        try {
          await deleteEdge(edge.id);
          deletedEdges++;
        } catch (err) {
          console.error('Error deleting edge:', err);
          errors++;
        }
      }

      for (const node of nodes) {
        try {
          await deleteNode(node.id);
          deletedNodes++;
        } catch (err) {
          console.error('Error deleting node:', err);
          errors++;
        }
      }

      flash(`✅ Deleted ${deletedNodes} nodes and ${deletedEdges} edges (${errors} errors)`, 'success');
      await load();
    } catch (err) {
      console.error('Delete all error:', err);
      flash('Failed to delete all data: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSyncing(false);
    }
  }

  // ── NODE CRUD ──
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

  // ── EDGE CRUD ──
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

  // Get room counts
  const totalRooms = rooms.length;
  const syncedRooms = nodes.filter(n => n.room).length;
  
  // Count rooms by purpose
  const purposeCounts = rooms.reduce((acc, room) => {
    const purpose = room.room_purpose || 'undefined';
    acc[purpose] = (acc[purpose] || 0) + 1;
    return acc;
  }, {});

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
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Navigation Manager</h1>
          <p className="text-gray-400 text-sm mt-1">
            Build the hostel map: add nodes (locations) then connect them with edges.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={load}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition">
            🔄 Refresh
          </button>
          <button onClick={syncRoomsToNodes} disabled={syncing}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
            {syncing ? '⏳ Syncing...' : '🔄 Sync Rooms'}
          </button>
          <button onClick={autoCreateEdges} disabled={syncing || nodes.length < 2}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
            {syncing ? '⏳ Creating...' : '🔗 Auto Create Edges'}
          </button>
          <button onClick={deleteAllData} disabled={syncing || nodes.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
            🗑️ Delete All
          </button>
        </div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Nodes</p>
          <p className="text-3xl font-bold text-white mt-1">{nodes.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Edges</p>
          <p className="text-3xl font-bold text-white mt-1">{edges.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Total Rooms</p>
          <p className="text-3xl font-bold text-white mt-1">{totalRooms}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Synced to Nodes</p>
          <p className="text-3xl font-bold text-white mt-1">{syncedRooms}</p>
        </div>
      </div>

      {/* Room Purpose Breakdown */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Room Purpose Breakdown</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(purposeCounts).map(([purpose, count]) => {
            const color = PURPOSE_COLORS[purpose] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
            return (
              <span key={purpose} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                {purpose}: {count}
              </span>
            );
          })}
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
                    Block ID <span className="text-gray-600">(optional)</span>
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
              <p className="text-gray-400 text-sm">Click the "Sync Rooms" button above or add your first location node manually.</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50 border-b border-gray-800">
                    <tr className="text-gray-500 text-xs uppercase tracking-wide">
                      <th className="px-5 py-4 text-left">ID</th>
                      <th className="px-5 py-4 text-left">Name</th>
                      <th className="px-5 py-4 text-left">Type</th>
                      <th className="px-5 py-4 text-left">Block</th>
                      <th className="px-5 py-4 text-left">Floor</th>
                      <th className="px-5 py-4 text-left">Room ID</th>
                      <th className="px-5 py-4 text-left">Linked Room</th>
                      <th className="px-5 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {nodes.map(n => {
                      const linkedRoom = rooms.find(r => r.id === n.room);
                      return (
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
                          <td className="px-5 py-4 text-gray-400">{n.room ?? '—'}</td>
                          <td className="px-5 py-4">
                            {linkedRoom ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                linkedRoom.room_purpose === 'residential' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : linkedRoom.room_purpose === 'reception'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {linkedRoom.room_number} ({linkedRoom.room_purpose})
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                          </td>
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
                      );
                    })}
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
                ⚠️ Add at least 2 nodes first before creating edges. Click "Sync Rooms" to create nodes automatically.
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
              <p className="text-gray-400 text-sm">Click "Auto Create Edges" to automatically connect nodes or add them manually above.</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50 border-b border-gray-800">
                    <tr className="text-gray-500 text-xs uppercase tracking-wide">
                      <th className="px-5 py-4 text-left">ID</th>
                      <th className="px-5 py-4 text-left">From</th>
                      <th className="px-5 py-4 text-left"></th>
                      <th className="px-5 py-4 text-left">To</th>
                      <th className="px-5 py-4 text-left">Weight</th>
                      <th className="px-5 py-4 text-left">Bidir</th>
                      <th className="px-5 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {edges.map(e => {
                      const fromNode = nodes.find(n => n.id === e.from_node);
                      const toNode = nodes.find(n => n.id === e.to_node);
                      return (
                        <tr key={e.id}
                          className={`hover:bg-gray-800/30 transition ${editEdgeId === e.id ? 'bg-purple-500/5' : ''}`}>
                          <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{e.id}</td>
                          <td className="px-5 py-4 text-white font-medium">
                            {e.from_node_name ?? fromNode?.name ?? e.from_node}
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            {e.bidirectional ? '↔' : '→'}
                          </td>
                          <td className="px-5 py-4 text-white font-medium">
                            {e.to_node_name ?? toNode?.name ?? e.to_node}
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
                      );
                    })}
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