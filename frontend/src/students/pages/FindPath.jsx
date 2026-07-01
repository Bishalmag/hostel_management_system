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
    if (!blockName) return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b8aaa', border: 'rgba(107, 114, 128, 0.3)' };
    const colors = {
      'Block A': { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      'Block B': { bg: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
      'Block C': { bg: 'rgba(29, 219, 168, 0.2)', color: '#1ddba8', border: 'rgba(29, 219, 168, 0.3)' },
      'Block D': { bg: 'rgba(245, 166, 35, 0.2)', color: '#f5a623', border: 'rgba(245, 166, 35, 0.3)' },
    };
    return colors[blockName] || { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b8aaa', border: 'rgba(107, 114, 128, 0.3)' };
  };

  return (
    <div style={{ maxWidth: '896px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#eaf2ff',
        margin: 0,
      }}>Find Shortest Path</h1>

      {/* Selection */}
      <div style={{
        background: '#0a1628',
        border: '1px solid #1a3050',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              Start Location *
            </label>
            <select
              value={fromNode}
              onChange={e => setFromNode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0a1628',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
            >
              <option value="">Select start...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '10px',
              color: '#6b8aaa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              Destination *
            </label>
            <select
              value={toNode}
              onChange={e => setToNode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0a1628',
                border: '1px solid #1a3050',
                borderRadius: '8px',
                color: '#eaf2ff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#1a3050'}
            >
              <option value="">Select destination...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={findPath}
            disabled={loading || !fromNode || !toNode}
            style={{
              flex: 1,
              padding: '10px',
              background: (loading || !fromNode || !toNode) ? '#1a3050' : '#a78bfa',
              color: (loading || !fromNode || !toNode) ? '#3a5070' : '#0a1628',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '8px',
              border: 'none',
              cursor: (loading || !fromNode || !toNode) ? 'not-allowed' : 'pointer',
              opacity: (loading || !fromNode || !toNode) ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading && fromNode && toNode) {
                e.currentTarget.style.background = '#9370db';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && fromNode && toNode) {
                e.currentTarget.style.background = '#a78bfa';
              }
            }}
          >
            {loading ? 'Finding...' : 'Find Shortest Path'}
          </button>
          <button
            onClick={resetPath}
            style={{
              padding: '10px 24px',
              background: 'rgba(18, 36, 72, 0.5)',
              color: '#c8daf0',
              fontWeight: 700,
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid #1a3050',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.5)';
            }}
          >
            Reset
          </button>
        </div>

        {error && (
          <div style={{
            color: '#f87171',
            fontSize: '14px',
            marginTop: '12px',
          }}>{error}</div>
        )}
      </div>

      {/* Path Result */}
      {path && (
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#eaf2ff',
            margin: '0 0 16px 0',
          }}>Shortest Path</h3>
          
          {/* Path steps with block and staircase indicators */}
          <div>
            {path.steps && path.steps.length > 0 ? (
              path.steps.map((step, index) => {
                const isStart = index === 0;
                const isEnd = index === path.steps.length - 1;
                const isStaircase = step.is_staircase;
                const isBlockChange = step.block_change;
                
                const getStepColor = () => {
                  if (isStart) return '#1ddba8';
                  if (isEnd) return '#f87171';
                  if (isStaircase) return '#f5a623';
                  if (isBlockChange) return '#a78bfa';
                  return '#6b8aaa';
                };
                
                const getStepBg = () => {
                  if (isStart) return 'rgba(29, 219, 168, 0.1)';
                  if (isEnd) return 'rgba(248, 113, 113, 0.1)';
                  if (isStaircase) return 'rgba(245, 166, 35, 0.1)';
                  if (isBlockChange) return 'rgba(167, 139, 250, 0.1)';
                  return 'rgba(18, 36, 72, 0.3)';
                };
                
                const getStepBorder = () => {
                  if (isStart) return 'rgba(29, 219, 168, 0.3)';
                  if (isEnd) return 'rgba(248, 113, 113, 0.3)';
                  if (isStaircase) return 'rgba(245, 166, 35, 0.3)';
                  if (isBlockChange) return 'rgba(167, 139, 250, 0.3)';
                  return 'transparent';
                };
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#0a1628',
                        background: getStepColor(),
                        flexShrink: 0,
                      }}>
                        {index + 1}
                      </div>
                      {index < path.steps.length - 1 && (
                        <div style={{
                          width: '2px',
                          height: '32px',
                          background: isStaircase ? 'rgba(245, 166, 35, 0.3)' : 
                                      isBlockChange ? 'rgba(167, 139, 250, 0.3)' : 
                                      'rgba(26, 48, 80, 0.5)',
                        }} />
                      )}
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: getStepBg(),
                      border: `1px solid ${getStepBorder()}`,
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{
                          fontWeight: 500,
                          color: getStepColor(),
                          fontSize: '14px',
                        }}>
                          {step.description}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#3a5070',
                        }}>
                          +{step.weight?.toFixed(1) || '0'}
                        </span>
                      </div>
                      
                      {/* Block information */}
                      {step.to_block && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px',
                        }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            border: `1px solid ${getBlockBadgeColor(step.to_block).border}`,
                            background: getBlockBadgeColor(step.to_block).bg,
                            color: getBlockBadgeColor(step.to_block).color,
                          }}>
                            🏢 {step.to_block}
                          </span>
                          {step.to_floor !== undefined && (
                            <span style={{
                              fontSize: '10px',
                              color: '#6b8aaa',
                            }}>
                              Floor {step.to_floor}
                            </span>
                          )}
                          {step.to_purpose && step.to_purpose !== 'residential' && (
                            <span style={{
                              fontSize: '10px',
                              color: '#6b8aaa',
                            }}>
                              • {step.to_purpose}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Staircase info */}
                      {isStaircase && (
                        <div style={{
                          fontSize: '10px',
                          color: '#f5a623',
                          marginTop: '4px',
                        }}>
                          🪜 {step.floor_change_direction === 'up' ? 'Up' : 'Down'} {Math.abs(step.floor_change)} floor{Math.abs(step.floor_change) > 1 ? 's' : ''}
                        </div>
                      )}
                      
                      {/* Block change info */}
                      {isBlockChange && (
                        <div style={{
                          fontSize: '10px',
                          color: '#a78bfa',
                          marginTop: '4px',
                        }}>
                          🚪 Moving from {step.from_block} → {step.to_block}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback: simple path display
              path.path_names.map((name, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#0a1628',
                    background: index === 0 ? '#1ddba8' : 
                                index === path.path_names.length - 1 ? '#f87171' : 
                                '#6b8aaa',
                  }}>
                    {index + 1}
                  </div>
                  <span style={{
                    fontWeight: 500,
                    color: index === 0 ? '#1ddba8' : 
                           index === path.path_names.length - 1 ? '#f87171' : 
                           '#eaf2ff',
                    fontSize: '14px',
                  }}>
                    {name}
                    {index === 0 && ' (Start)'}
                    {index === path.path_names.length - 1 && ' (Destination)'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #1a3050',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div>
                <p style={{
                  color: '#6b8aaa',
                  fontSize: '14px',
                  margin: 0,
                }}>
                  {path.path_names && path.path_names.length > 0 && (
                    <>
                      {path.path_names[0]} → {path.path_names[path.path_names.length - 1]}
                    </>
                  )}
                </p>
                <p style={{
                  color: '#3a5070',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {path.path_names && path.path_names.length - 1} {path.path_names && path.path_names.length - 1 === 1 ? 'stop' : 'stops'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  color: '#eaf2ff',
                  fontWeight: 700,
                  margin: 0,
                }}>
                  Distance: {path.total_cost} units
                </p>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                  marginTop: '4px',
                }}>
                  {path.steps && path.steps.filter(s => s.is_staircase).length > 0 && (
                    <span style={{
                      color: '#f5a623',
                      fontSize: '10px',
                    }}>
                      🪜 {path.steps.filter(s => s.is_staircase).length} staircase{path.steps.filter(s => s.is_staircase).length > 1 ? 's' : ''}
                    </span>
                  )}
                  {path.steps && path.steps.filter(s => s.block_change).length > 0 && (
                    <span style={{
                      color: '#a78bfa',
                      fontSize: '10px',
                    }}>
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