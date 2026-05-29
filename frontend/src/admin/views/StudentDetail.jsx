import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-800 last:border-0">
    <span className="text-xs text-gray-500 uppercase tracking-wide w-40 flex-shrink-0">{label}</span>
    <span className="text-sm text-white">{value ?? '—'}</span>
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

  if (loading) return <div className="text-gray-500 text-center py-10">Loading...</div>;
  if (!student) return <div className="text-gray-500 text-center py-10">Student not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button onClick={() => navigate('/admin/students')}
          className="text-sm text-gray-500 hover:text-purple-400 mb-3">← Back</button>
        <h1 className="text-2xl font-bold text-white">{student.user_name}</h1>
        <p className="text-gray-500 text-sm mt-1">{student.user_email}</p>
      </div>

      {[
        { title: 'Personal Info', rows: [
          { label: 'Registration No', value: student.registration_no },
          { label: 'Course', value: student.course },
          { label: 'Gender', value: student.gender },
          { label: 'Phone', value: student.phone },
        ]},
        { title: 'Emergency Contact', rows: [
          { label: 'Guardian Name', value: student.guardian_name },
          { label: 'Relation', value: student.guardian_relation },
          { label: 'Contact', value: student.guardian_contact },
        ]},
        { title: 'Temporary Address', rows: [
          { label: 'Address', value: student.temp_address },
          { label: 'City', value: student.temp_city },
          { label: 'State', value: student.temp_state },
          { label: 'Pincode', value: student.temp_pincode },
        ]},
        { title: 'Permanent Address', rows: [
          { label: 'Address', value: student.perm_address },
          { label: 'City', value: student.perm_city },
          { label: 'State', value: student.perm_state },
          { label: 'Pincode', value: student.perm_pincode },
        ]},
      ].map(section => (
        <div key={section.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">{section.title}</h3>
          {section.rows.map(r => <Row key={r.label} label={r.label} value={r.value} />)}
        </div>
      ))}
    </div>
  );
};

export default StudentDetail;