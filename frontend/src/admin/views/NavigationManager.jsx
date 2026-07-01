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
  entrance: { bg: 'rgba(99, 102, 241, 0.2)', text: '#818cf8' },
  block:    { bg: 'rgba(14, 165, 233, 0.2)', text: '#38bdf8' },
  floor:    { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399' },
  room:     { bg: 'rgba(234, 179, 8, 0.2)', text: '#fbbf24' },
  common:   { bg: 'rgba(168, 85, 247, 0.2)', text: '#a78bfa' },
};

const PURPOSE_COLORS = {
  residential: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  reception: { bg: 'rgba(168, 85, 247, 0.2)', text: '#a78bfa', border: 'rgba(168, 85, 247, 0.3)' },
  office: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  lobby: { bg: 'rgba(99, 102, 241, 0.2)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  DI_room: { bg: 'rgba(6, 182, 212, 0.2)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  library: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  canteen: { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  hall: { bg: 'rgba(244, 63, 94, 0.2)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
};

export default function NavigationManager() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [tab, setTab] = useState('nodes');
  const [nodeForm, setNodeForm] = useState(EMPTY_NODE);
  const [edgeForm, setEdgeForm] = useState(EMPTY_EDGE);
  const [editNodeId, setEditNodeId] = useState(null);
  const [editEdgeId, setEditEdgeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);

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

      const nodesData = n.data.results ?? n.data;
      const edgesData = e.data.results ?? e.data;
      const roomsData = r.data.results ?? r.data;
      const floorsData = f.data.results ?? f.data;
      const blocksData = b.data.results ?? b.data;

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

      for (const room of allRooms) {
        try {
          const existingNode = nodes.find(node => node.room === room.id);
          
          if (!existingNode) {
            let nodeName;
            if (room.room_purpose === 'residential') {
              nodeName = `Room ${room.room_number}`;
            } else if (room.room_purpose) {
              const purposeDisplay = room.room_purpose.charAt(0).toUpperCase() + room.room_purpose.slice(1);
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
      await load();
    } catch (err) {
      console.error('Sync error:', err);
      flash('Failed to sync rooms: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSyncing(false);
    }
  }

  // ── AUTO CREATE EDGES ──
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
          await createEdge(edgeData);
          created++;
          existingEdges.push({ from: fromNode.id, to: toNode.id });
        } catch (err) {
          console.error('Error creating edge:', err);
          errors++;
        }
      };

      const nodesByFloor = {};
      nodes.forEach(node => {
        if (node.floor) {
          if (!nodesByFloor[node.floor]) {
            nodesByFloor[node.floor] = [];
          }
          nodesByFloor[node.floor].push(node);
        }
      });

      for (const floorId in nodesByFloor) {
        const floorNodes = [...nodesByFloor[floorId]].sort((a, b) => a.name.localeCompare(b.name));
        for (let i = 0; i < floorNodes.length - 1; i++) {
          await tryCreate(floorNodes[i], floorNodes[i + 1], 1.0);
        }
      }

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
          await tryCreate(repA, repB, 2.0);
        }
      }

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
        await tryCreate(repA, repB, 3.0);
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
    if (!payload.room) delete payload.room;
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

  const totalRooms = rooms.length;
  const syncedRooms = nodes.filter(n => n.room).length;
  
  const purposeCounts = rooms.reduce((acc, room) => {
    const purpose = room.room_purpose || 'undefined';
    acc[purpose] = (acc[purpose] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#eaf2ff', margin: 0 }}>Navigation Manager</h1>
      <div style={{ textAlign: 'center', color: '#6b8aaa', padding: '48px 0' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #1a3050',
          borderTop: '3px solid #f5a623',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        Loading...
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Navigation Manager</h1>
          <p style={{
            color: '#6b8aaa',
            fontSize: '14px',
            marginTop: '4px',
            marginBottom: 0,
          }}>
            Build the hostel map: add nodes (locations) then connect them with edges.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={load}
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
            ⟳ Refresh
          </button>
          <button onClick={syncRoomsToNodes} disabled={syncing}
            style={{
              padding: '8px 16px',
              background: syncing ? '#3a5070' : '#f5a623',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: syncing ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
              opacity: syncing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!syncing) e.currentTarget.style.background = '#e09515';
            }}
            onMouseLeave={(e) => {
              if (!syncing) e.currentTarget.style.background = '#f5a623';
            }}
          >
            {syncing ? '⏳ Syncing...' : '⟳ Sync Rooms'}
          </button>
          <button onClick={autoCreateEdges} disabled={syncing || nodes.length < 2}
            style={{
              padding: '8px 16px',
              background: (syncing || nodes.length < 2) ? '#3a5070' : '#1ddba8',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: (syncing || nodes.length < 2) ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
              opacity: (syncing || nodes.length < 2) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!syncing && nodes.length >= 2) e.currentTarget.style.background = '#16c39a';
            }}
            onMouseLeave={(e) => {
              if (!syncing && nodes.length >= 2) e.currentTarget.style.background = '#1ddba8';
            }}
          >
            {syncing ? '⏳ Creating...' : '🔗 Auto Create Edges'}
          </button>
          <button onClick={deleteAllData} disabled={syncing || nodes.length === 0}
            style={{
              padding: '8px 16px',
              background: (syncing || nodes.length === 0) ? '#3a5070' : '#f87171',
              color: '#0a1628',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: (syncing || nodes.length === 0) ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
              opacity: (syncing || nodes.length === 0) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!syncing && nodes.length > 0) e.currentTarget.style.background = '#ef4444';
            }}
            onMouseLeave={(e) => {
              if (!syncing && nodes.length > 0) e.currentTarget.style.background = '#f87171';
            }}
          >
            🗑 Delete All
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid',
          background: toast.type === 'error' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(29, 219, 168, 0.2)',
          color: toast.type === 'error' ? '#f87171' : '#1ddba8',
          borderColor: toast.type === 'error' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(29, 219, 168, 0.3)',
        }}>
          {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Total Nodes</p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginTop: '4px',
            marginBottom: 0,
          }}>{nodes.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Total Edges</p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginTop: '4px',
            marginBottom: 0,
          }}>{edges.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Total Rooms</p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginTop: '4px',
            marginBottom: 0,
          }}>{totalRooms}</p>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{
            color: '#6b8aaa',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}>Synced to Nodes</p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#eaf2ff',
            marginTop: '4px',
            marginBottom: 0,
          }}>{syncedRooms}</p>
        </div>
      </div>

      {/* Room Purpose Breakdown */}
      <div style={{
        background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
        border: '1px solid #1a3050',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <p style={{
          color: '#6b8aaa',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          marginTop: 0,
        }}>Room Purpose Breakdown</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(purposeCounts).map(([purpose, count]) => {
            const color = PURPOSE_COLORS[purpose] || { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa', border: 'rgba(107, 138, 170, 0.3)' };
            return (
              <span key={purpose} style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`,
              }}>
                {purpose}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #1a3050',
      }}>
        {[
          { key: 'nodes', label: `Nodes (${nodes.length})` },
          { key: 'edges', label: `Edges (${edges.length})` },
        ].map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); cancelNode(); cancelEdge(); }}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: tab === t.key ? '#a78bfa' : '#6b8aaa',
              borderBottom: tab === t.key ? '2px solid #a78bfa' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (tab !== t.key) e.currentTarget.style.color = '#c8daf0';
            }}
            onMouseLeave={(e) => {
              if (tab !== t.key) e.currentTarget.style.color = '#6b8aaa';
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ NODES TAB ═══ */}
      {tab === 'nodes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Form */}
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
            }}>
              {editNodeId ? '✏️ Edit Node' : '➕ Add Node'}
            </h2>
            <form onSubmit={handleNodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    Node Name *
                  </label>
                  <input required
                    placeholder="e.g. Block A Entrance"
                    value={nodeForm.name}
                    onChange={e => setNodeForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }} />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    Node Type *
                  </label>
                  <select
                    value={nodeForm.node_type}
                    onChange={e => setNodeForm(f => ({ ...f, node_type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }}>
                    {NODE_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    Block ID <span style={{ color: '#3a5070' }}>(optional)</span>
                  </label>
                  <input type="number"
                    placeholder="Leave blank if not applicable"
                    value={nodeForm.block}
                    onChange={e => setNodeForm(f => ({ ...f, block: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }} />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    Floor ID <span style={{ color: '#3a5070' }}>(optional)</span>
                  </label>
                  <input type="number"
                    placeholder="Leave blank if not applicable"
                    value={nodeForm.floor}
                    onChange={e => setNodeForm(f => ({ ...f, floor: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }} />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    Room ID <span style={{ color: '#3a5070' }}>(optional)</span>
                  </label>
                  <input type="number"
                    placeholder="Leave blank if not applicable"
                    value={nodeForm.room}
                    onChange={e => setNodeForm(f => ({ ...f, room: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="submit" disabled={saving}
                  style={{
                    padding: '10px 20px',
                    background: saving ? '#3a5070' : '#a78bfa',
                    color: '#0a1628',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s ease',
                    opacity: saving ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) e.currentTarget.style.background = '#8b5cf6';
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) e.currentTarget.style.background = '#a78bfa';
                  }}>
                  {saving ? 'Saving...' : editNodeId ? 'Update Node' : 'Add Node'}
                </button>
                {editNodeId && (
                  <button type="button" onClick={cancelNode}
                    style={{
                      padding: '10px 20px',
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
                    }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Node table */}
          {nodes.length === 0 ? (
            <div style={{
              background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
              border: '1px solid #1a3050',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>◇</div>
              <h3 style={{
                color: '#eaf2ff',
                fontWeight: 600,
                marginBottom: '4px',
                fontSize: '18px',
                marginTop: 0,
              }}>No nodes yet</h3>
              <p style={{ color: '#6b8aaa', fontSize: '14px' }}>
                Click the "Sync Rooms" button above or add your first location node manually.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
              border: '1px solid #1a3050',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
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
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Block</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Floor</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Room ID</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Linked Room</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map(n => {
                      const linkedRoom = rooms.find(r => r.id === n.room);
                      const typeColor = TYPE_COLORS[n.node_type] || { bg: 'rgba(107, 138, 170, 0.2)', text: '#6b8aaa' };
                      return (
                        <tr key={n.id}
                          style={{
                            borderBottom: '1px solid #1a3050',
                            transition: 'background 0.2s ease',
                            background: editNodeId === n.id ? 'rgba(167, 139, 250, 0.05)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (editNodeId !== n.id) e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            if (editNodeId !== n.id) e.currentTarget.style.background = 'transparent';
                          }}>
                          <td style={{ padding: '16px 20px', color: '#6b8aaa', fontFamily: 'monospace', fontSize: '12px' }}>#{n.id}</td>
                          <td style={{ padding: '16px 20px', color: '#eaf2ff', fontWeight: 500 }}>{n.name}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: typeColor.bg,
                              color: typeColor.text,
                            }}>
                              {n.node_type}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#6b8aaa' }}>{n.block ?? '—'}</td>
                          <td style={{ padding: '16px 20px', color: '#6b8aaa' }}>{n.floor ?? '—'}</td>
                          <td style={{ padding: '16px 20px', color: '#6b8aaa' }}>{n.room ?? '—'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            {linkedRoom ? (
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: linkedRoom.room_purpose === 'residential' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                color: linkedRoom.room_purpose === 'residential' ? '#34d399' : '#fbbf24',
                              }}>
                                {linkedRoom.room_number} ({linkedRoom.room_purpose})
                              </span>
                            ) : (
                              <span style={{ color: '#3a5070', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => startEditNode(n)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(96, 165, 250, 0.2)',
                                  color: '#60a5fa',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  transition: 'background 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                                }}>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteNode(n.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(248, 113, 113, 0.2)',
                                  color: '#f87171',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  transition: 'background 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                                }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Form */}
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
            }}>
              {editEdgeId ? '✏️ Edit Edge' : '➕ Add Edge'}
            </h2>
            {nodes.length < 2 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(245, 166, 35, 0.1)',
                border: '1px solid rgba(245, 166, 35, 0.3)',
                borderRadius: '8px',
                color: '#f5a623',
                fontSize: '14px',
              }}>
                ⚠️ Add at least 2 nodes first before creating edges. Click "Sync Rooms" to create nodes automatically.
              </div>
            )}
            <form onSubmit={handleEdgeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    From Node *
                  </label>
                  <select required
                    value={edgeForm.from_node}
                    onChange={e => setEdgeForm(f => ({ ...f, from_node: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }}>
                    <option value="">Select node...</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    To Node *
                  </label>
                  <select required
                    value={edgeForm.to_node}
                    onChange={e => setEdgeForm(f => ({ ...f, to_node: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }}>
                    <option value="">Select node...</option>
                    {nodes.filter(n => n.id !== parseInt(edgeForm.from_node))
                          .map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#6b8aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    Weight (distance / time)
                  </label>
                  <input type="number" min="0.1" step="0.1"
                    value={edgeForm.weight}
                    onChange={e => setEdgeForm(f => ({ ...f, weight: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#0f2040',
                      border: '1px solid #1a3050',
                      borderRadius: '8px',
                      color: '#eaf2ff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#a78bfa';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#1a3050';
                    }} />
                </div>
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}>
                <input type="checkbox"
                  checked={edgeForm.bidirectional}
                  onChange={e => setEdgeForm(f => ({ ...f, bidirectional: e.target.checked }))}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#a78bfa',
                  }} />
                <span style={{ fontSize: '14px', color: '#c8daf0' }}>
                  Bidirectional <span style={{ color: '#3a5070' }}>(A ↔ B — uncheck for one-way A → B only)</span>
                </span>
              </label>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button type="submit" disabled={saving || nodes.length < 2}
                  style={{
                    padding: '10px 20px',
                    background: (saving || nodes.length < 2) ? '#3a5070' : '#a78bfa',
                    color: '#0a1628',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: (saving || nodes.length < 2) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s ease',
                    opacity: (saving || nodes.length < 2) ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!saving && nodes.length >= 2) e.currentTarget.style.background = '#8b5cf6';
                  }}
                  onMouseLeave={(e) => {
                    if (!saving && nodes.length >= 2) e.currentTarget.style.background = '#a78bfa';
                  }}>
                  {saving ? 'Saving...' : editEdgeId ? 'Update Edge' : 'Add Edge'}
                </button>
                {editEdgeId && (
                  <button type="button" onClick={cancelEdge}
                    style={{
                      padding: '10px 20px',
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
                    }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Edge table */}
          {edges.length === 0 ? (
            <div style={{
              background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
              border: '1px solid #1a3050',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>◇</div>
              <h3 style={{
                color: '#eaf2ff',
                fontWeight: 600,
                marginBottom: '4px',
                fontSize: '18px',
                marginTop: 0,
              }}>No edges yet</h3>
              <p style={{ color: '#6b8aaa', fontSize: '14px' }}>
                Click "Auto Create Edges" to automatically connect nodes or add them manually above.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
              border: '1px solid #1a3050',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
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
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>From</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}></th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>To</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Weight</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Bidir</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edges.map(e => {
                      const fromNode = nodes.find(n => n.id === e.from_node);
                      const toNode = nodes.find(n => n.id === e.to_node);
                      return (
                        <tr key={e.id}
                          style={{
                            borderBottom: '1px solid #1a3050',
                            transition: 'background 0.2s ease',
                            background: editEdgeId === e.id ? 'rgba(167, 139, 250, 0.05)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (editEdgeId !== e.currentTarget.dataset.id) {
                              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (editEdgeId !== e.currentTarget.dataset.id) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                          data-id={e.id}>
                          <td style={{ padding: '16px 20px', color: '#6b8aaa', fontFamily: 'monospace', fontSize: '12px' }}>#{e.id}</td>
                          <td style={{ padding: '16px 20px', color: '#eaf2ff', fontWeight: 500 }}>
                            {e.from_node_name ?? fromNode?.name ?? e.from_node}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#3a5070' }}>
                            {e.bidirectional ? '↔' : '→'}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#eaf2ff', fontWeight: 500 }}>
                            {e.to_node_name ?? toNode?.name ?? e.to_node}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#c8daf0' }}>{e.weight}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: e.bidirectional ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 138, 170, 0.2)',
                              color: e.bidirectional ? '#34d399' : '#6b8aaa',
                            }}>
                              {e.bidirectional ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => startEditEdge(e)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(96, 165, 250, 0.2)',
                                  color: '#60a5fa',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  transition: 'background 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                                }}>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteEdge(e.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(248, 113, 113, 0.2)',
                                  color: '#f87171',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  transition: 'background 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)';
                                }}>
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