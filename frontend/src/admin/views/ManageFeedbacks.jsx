import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/');
      const allFeedbacks = response.data.results ?? response.data;
      setFeedbacks(allFeedbacks);
      
      const total = allFeedbacks.length;
      const totalRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = total > 0 ? (totalRating / total).toFixed(1) : 0;
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allFeedbacks.forEach(f => {
        distribution[f.rating] = (distribution[f.rating] || 0) + 1;
      });
      
      setStats({ total, averageRating, distribution });
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const getFilteredFeedbacks = () => {
    if (filter === 'all') return feedbacks;
    return feedbacks.filter(f => f.rating === parseInt(filter));
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return labels[rating];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredFeedbacks = getFilteredFeedbacks();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#eaf2ff',
            margin: 0,
          }}>Manage Feedbacks</h1>
          <button
            onClick={fetchFeedbacks}
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
            Refresh
          </button>
        </div>
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
          Loading feedbacks...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>Manage Feedbacks</h1>
        <button
          onClick={fetchFeedbacks}
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
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Total Feedbacks</p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#eaf2ff',
                margin: '4px 0 0 0',
              }}>{stats.total}</p>
            </div>
            <div style={{ fontSize: '28px', color: '#6b8aaa' }}>◇</div>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Average Rating</p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#f5a623',
                margin: '4px 0 0 0',
              }}>{stats.averageRating}</p>
            </div>
            <div style={{ fontSize: '24px', color: '#f5a623' }}>★</div>
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{
                color: '#6b8aaa',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}>Response Rate</p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1ddba8',
                margin: '4px 0 0 0',
              }}>
                {feedbacks.length > 0 ? Math.round((feedbacks.length / (feedbacks.length + 10)) * 100) : 0}%
              </p>
            </div>
            <div style={{ fontSize: '28px', color: '#6b8aaa' }}>◈</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {feedbacks.length > 0 && (
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
          }}>Rating Distribution</h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '96px',
                  fontSize: '14px',
                  color: '#6b8aaa',
                }}>{getRatingLabel(rating)}</div>
                <div style={{
                  flex: 1,
                }}>
                  <div style={{
                    height: '8px',
                    background: '#1a3050',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      background: '#f5a623',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                      width: `${(stats.distribution[rating] / feedbacks.length) * 100}%`,
                    }} />
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  fontSize: '14px',
                  color: '#6b8aaa',
                  textAlign: 'right',
                }}>{stats.distribution[rating]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #1a3050',
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: filter === 'all' ? '#f5a623' : '#6b8aaa',
            borderBottom: filter === 'all' ? '2px solid #f5a623' : '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.color = '#c8daf0';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.color = '#6b8aaa';
            }
          }}
        >
          All Feedbacks
          <span style={{
            marginLeft: '8px',
            padding: '2px 6px',
            fontSize: '12px',
            background: 'rgba(107, 138, 170, 0.2)',
            borderRadius: '20px',
          }}>{feedbacks.length}</span>
        </button>
        {[5, 4, 3, 2, 1].map(rating => (
          <button
            key={rating}
            onClick={() => setFilter(rating.toString())}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: filter === rating.toString() ? '#f5a623' : '#6b8aaa',
              borderBottom: filter === rating.toString() ? '2px solid #f5a623' : '2px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (filter !== rating.toString()) {
                e.currentTarget.style.color = '#c8daf0';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== rating.toString()) {
                e.currentTarget.style.color = '#6b8aaa';
              }
            }}
          >
            {renderStars(rating)}
            <span style={{
              marginLeft: '8px',
              padding: '2px 6px',
              fontSize: '12px',
              background: 'rgba(107, 138, 170, 0.2)',
              borderRadius: '20px',
            }}>{stats.distribution[rating]}</span>
          </button>
        ))}
      </div>

      {/* Feedbacks Table */}
      {filteredFeedbacks.length === 0 ? (
        <div style={{
          background: 'linear-gradient(to bottom right, #0a1628, #050d1a)',
          border: '1px solid #1a3050',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>◇</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#eaf2ff',
            marginBottom: '8px',
          }}>No Feedbacks Found</h3>
          <p style={{
            color: '#6b8aaa',
            margin: 0,
          }}>
            {filter === 'all' 
              ? "No feedbacks have been submitted yet." 
              : `No ${getRatingLabel(parseInt(filter)).toLowerCase()} ratings found.`}
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
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Rating</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Comment</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    style={{
                      borderBottom: '1px solid #1a3050',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{
                        color: '#6b8aaa',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        margin: 0,
                      }}>#{feedback.id}</p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div>
                        <p style={{
                          color: '#eaf2ff',
                          fontSize: '14px',
                          margin: 0,
                        }}>{feedback.user_name || `User ${feedback.user}`}</p>
                        <p style={{
                          color: '#6b8aaa',
                          fontSize: '12px',
                          margin: '4px 0 0 0',
                        }}>{feedback.user_email}</p>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{
                          color: '#f5a623',
                          fontSize: '14px',
                        }}>{renderStars(feedback.rating)}</span>
                        <span style={{
                          color: '#6b8aaa',
                          fontSize: '12px',
                        }}>({feedback.rating}/5)</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{
                        color: '#c8daf0',
                        fontSize: '14px',
                        maxWidth: '384px',
                        margin: 0,
                      }}>
                        {feedback.comment || <span style={{ color: '#6b8aaa', fontStyle: 'italic' }}>No comment provided</span>}
                      </p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{
                        color: '#c8daf0',
                        fontSize: '12px',
                        margin: 0,
                      }}>{formatDate(feedback.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
};

export default ManageFeedbacks;