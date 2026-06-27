// students/views/FindPath.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const FindPath = () => {
  const [nodes, setNodes] = useState([]);
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await api.get('/hostel/nodes-public/');
        setNodes(response.data);
      } catch (err) {
        console.error('Error fetching nodes:', err);
      }
    };
    fetchNodes();
  }, []);

  const findPath = async () => {
    if (!fromNode || !toNode) {
      setError('Please select both start and destination');
      return;
    }

    setLoading(true);
    setError('');
    setPath(null);

    try {
      const response = await api.get(`/hostel/navigate/?from=${fromNode}&to=${toNode}`);
      
      if (response.data.found) {
        setPath(response.data);
      } else {
        setError('No path found between these locations');
      }
    } catch (err) {
      console.error('Error finding path:', err);
      setError(err.response?.data?.error || 'Failed to find path');
    } finally {
      setLoading(false);
    }
  };

  const resetPath = () => {
    setPath(null);
    setFromNode('');
    setToNode('');
    setError('');
  };

  const getBlockBadgeColor = (blockName) => {
    if (!blockName) return 'bg-gray-600';
    // Different colors for different blocks
    const colors = {
      'Block A': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Block B': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Block C': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Block D': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[blockName] || 'bg-gray-600';
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Find Shortest Path</h1>

      {/* Selection */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Start Location *
            </label>
            <select
              value={fromNode}
              onChange={e => setFromNode(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">Select start...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Destination *
            </label>
            <select
              value={toNode}
              onChange={e => setToNode(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">Select destination...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={findPath}
            disabled={loading || !fromNode || !toNode}
            className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Finding...' : 'Find Shortest Path'}
          </button>
          <button
            onClick={resetPath}
            className="py-2.5 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm rounded-lg transition"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
      </div>

      {/* Path Result */}
      {path && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Shortest Path</h3>
          
          {/* Path steps with block and staircase indicators */}
          <div className="space-y-3">
            {path.steps && path.steps.length > 0 ? (
              path.steps.map((step, index) => {
                const isStart = index === 0;
                const isEnd = index === path.steps.length - 1;
                const isStaircase = step.is_staircase;
                const isBlockChange = step.block_change;
                
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isStart ? 'bg-green-500' : 
                        isEnd ? 'bg-red-500' : 
                        isStaircase ? 'bg-yellow-500' : 
                        isBlockChange ? 'bg-purple-500' : 'bg-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      {index < path.steps.length - 1 && (
                        <div className={`w-0.5 h-8 ${
                          isStaircase ? 'bg-yellow-500/50' : 
                          isBlockChange ? 'bg-purple-500/50' : 
                          'bg-gray-600'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`px-3 py-2 rounded-lg ${
                        isStart ? 'bg-green-500/20 border border-green-500/30' :
                        isEnd ? 'bg-red-500/20 border border-red-500/30' :
                        isStaircase ? 'bg-yellow-500/20 border border-yellow-500/30' :
                        isBlockChange ? 'bg-purple-500/20 border border-purple-500/30' :
                        'bg-gray-800'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${
                            isStart ? 'text-green-400' :
                            isEnd ? 'text-red-400' :
                            isStaircase ? 'text-yellow-400' :
                            isBlockChange ? 'text-purple-400' :
                            'text-white'
                          }`}>
                            {step.description}
                          </span>
                          <span className="text-xs text-gray-500">
                            +{step.weight?.toFixed(1) || '0'}
                          </span>
                        </div>
                        
                        {/* Block information */}
                        {step.to_block && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getBlockBadgeColor(step.to_block)}`}>
                              🏢 {step.to_block}
                            </span>
                            {step.to_floor !== undefined && (
                              <span className="text-xs text-gray-400">
                                Floor {step.to_floor}
                              </span>
                            )}
                            {step.to_purpose && step.to_purpose !== 'residential' && (
                              <span className="text-xs text-gray-400">
                                • {step.to_purpose}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Staircase info */}
                        {isStaircase && (
                          <div className="text-xs text-yellow-400 mt-1">
                            🪜 {step.floor_change_direction === 'up' ? 'Up' : 'Down'} {Math.abs(step.floor_change)} floor{Math.abs(step.floor_change) > 1 ? 's' : ''}
                          </div>
                        )}
                        
                        {/* Block change info */}
                        {isBlockChange && (
                          <div className="text-xs text-purple-400 mt-1">
                            🚪 Moving from {step.from_block} → {step.to_block}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback: simple path display
              path.path_names.map((name, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-green-500' : 
                    index === path.path_names.length - 1 ? 'bg-red-500' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`font-medium ${
                    index === 0 ? 'text-green-400' : 
                    index === path.path_names.length - 1 ? 'text-red-400' : 'text-white'
                  }`}>
                    {name}
                    {index === 0 && ' (Start)'}
                    {index === path.path_names.length - 1 && ' (Destination)'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="text-gray-400 text-sm">
                  {path.path_names && path.path_names.length > 0 && (
                    <>
                      {path.path_names[0]} → {path.path_names[path.path_names.length - 1]}
                    </>
                  )}
                </p>
                <p className="text-gray-500 text-xs">
                  {path.path_names && path.path_names.length - 1} {path.path_names && path.path_names.length - 1 === 1 ? 'stop' : 'stops'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  Distance: {path.total_cost} units
                </p>
                <div className="flex gap-2 justify-end flex-wrap">
                  {path.steps && path.steps.filter(s => s.is_staircase).length > 0 && (
                    <span className="text-yellow-400 text-xs">
                      🪜 {path.steps.filter(s => s.is_staircase).length} staircase{path.steps.filter(s => s.is_staircase).length > 1 ? 's' : ''}
                    </span>
                  )}
                  {path.steps && path.steps.filter(s => s.block_change).length > 0 && (
                    <span className="text-purple-400 text-xs">
                      🏢 {path.steps.filter(s => s.block_change).length} block change{path.steps.filter(s => s.block_change).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPath;