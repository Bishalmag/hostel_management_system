import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const ComplaintRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form,       setForm]       = useState({ description: '', status: 'pending' });
  const [loading,    setLoading]    = useState(false);
  const [message,    setMessage]    = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setLoading(true);
    try {
      await api.post('/complaints/', {
        description: form.description,
        student: user?.id,
      });
      setMessage({ type: 'success', text: 'Complaint submitted successfully!' });
      setTimeout(() => navigate('/students/complaints'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit complaint.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button onClick={() => navigate('/students/complaints')}
          className="text-sm text-gray-500 hover:text-cyan-400 transition mb-3 flex items-center gap-2">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Raise a Complaint</h1>
        <p className="text-gray-500 text-sm mt-1">Describe your issue and we'll look into it</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {message.text && (
          <div className={`mb-5 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
              Describe your complaint <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={6} placeholder="Describe the issue in detail..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <span>⚠️</span>
            <p className="text-xs text-yellow-400">False complaints may result in disciplinary action.</p>
          </div>

          <button type="submit" disabled={loading || !form.description.trim()}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-lg transition disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintRegistration;