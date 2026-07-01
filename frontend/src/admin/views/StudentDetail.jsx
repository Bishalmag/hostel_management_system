import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const Row = ({ label, value }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '10px 0',
    borderBottom: '1px solid #1a3050',
  }}>
    <span style={{
      fontSize: '12px',
      color: '#6b8aaa',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      width: '160px',
      flexShrink: 0,
    }}>{label}</span>
    <span style={{
      fontSize: '14px',
      color: '#eaf2ff',
    }}>{value ?? '—'}</span>
  </div>
);

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/students/${id}/`)
      .then(res => setStudent(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '256px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #1a3050',
            borderTop: '3px solid #f5a623',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b8aaa' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{
        textAlign: 'center',
        color: '#6b8aaa',
        padding: '40px 0',
      }}>
        Student not found.
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '672px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div>
        <button
          onClick={() => navigate('/admin/students')}
          style={{
            fontSize: '14px',
            color: '#6b8aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b8aaa';
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#eaf2ff',
          margin: 0,
        }}>{student.user_name}</h1>
        <p style={{
          color: '#6b8aaa',
          fontSize: '14px',
          marginTop: '4px',
          marginBottom: 0,
        }}>{student.user_email}</p>
      </div>

      {[
        {
          title: 'Personal Info',
          rows: [
            { label: 'Registration No', value: student.registration_no },
            { label: 'Course', value: student.course },
            { label: 'Gender', value: student.gender },
            { label: 'Phone', value: student.phone },
          ]
        },
        {
          title: 'Emergency Contact',
          rows: [
            { label: 'Guardian Name', value: student.guardian_name },
            { label: 'Relation', value: student.guardian_relation },
            { label: 'Contact', value: student.guardian_contact },
          ]
        },
        {
          title: 'Temporary Address',
          rows: [
            { label: 'Address', value: student.temp_address },
            { label: 'City', value: student.temp_city },
            { label: 'State', value: student.temp_state },
            { label: 'Pincode', value: student.temp_pincode },
          ]
        },
        {
          title: 'Permanent Address',
          rows: [
            { label: 'Address', value: student.perm_address },
            { label: 'City', value: student.perm_city },
            { label: 'State', value: student.perm_state },
            { label: 'Pincode', value: student.perm_pincode },
          ]
        },
      ].map(section => (
        <div key={section.title} style={{
          background: '#0a1628',
          border: '1px solid #1a3050',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#a78bfa',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
            marginTop: 0,
          }}>{section.title}</h3>
          {section.rows.map(r => <Row key={r.label} label={r.label} value={r.value} />)}
        </div>
      ))}

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

export default StudentDetail;