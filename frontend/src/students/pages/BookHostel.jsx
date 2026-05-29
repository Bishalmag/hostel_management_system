import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const inputCls = 'w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500';
const labelCls = 'block text-xs text-gray-500 uppercase tracking-wide mb-1';

const Section = ({ title, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider border-b border-gray-800 pb-3">
      {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className={labelCls}>{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
    {children}
  </div>
);

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hostel,     setHostel]     = useState(null);
  const [rooms,      setRooms]      = useState([]);
  const [student,    setStudent]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState({ type: '', text: '' });
  const [sameAddr,   setSameAddr]   = useState(false);

  const [form, setForm] = useState({
    // Room
    room:           '',
    check_in_date:  '',
    check_out_date: '',
    total_amount:   '',

    // Personal
    registration_no:  '',
    course:           '',
    middle_name:      '',
    gender:           '',
    phone:            '',

    // Emergency
    guardian_name:     '',
    guardian_relation: '',
    guardian_contact:  '',

    // Temp address
    temp_address: '',
    temp_city:    '',
    temp_state:   '',
    temp_pincode: '',

    // Perm address
    perm_address: '',
    perm_city:    '',
    perm_state:   '',
    perm_pincode: '',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/hostel/hostels/${id}/`),
      api.get(`/hostel/rooms/`),
      api.get(`/students/`),
    ]).then(([hRes, rRes, sRes]) => {
      setHostel(hRes.data);
      // filter rooms belonging to this hostel
      const allRooms = rRes.data.results ?? rRes.data;
      setRooms(allRooms);
      // get current student profile
      const students = sRes.data.results ?? sRes.data;
      const me = students.find(s => s.user === user?.id);
      if (me) {
        setStudent(me);
        setForm(f => ({
          ...f,
          registration_no:   me.registration_no ?? '',
          course:            me.course ?? '',
          middle_name:       me.middle_name ?? '',
          gender:            me.gender ?? '',
          phone:             me.phone ?? '',
          guardian_name:     me.guardian_name ?? '',
          guardian_relation: me.guardian_relation ?? '',
          guardian_contact:  me.guardian_contact ?? '',
          temp_address:      me.temp_address ?? '',
          temp_city:         me.temp_city ?? '',
          temp_state:        me.temp_state ?? '',
          temp_pincode:      me.temp_pincode ?? '',
          perm_address:      me.perm_address ?? '',
          perm_city:         me.perm_city ?? '',
          perm_state:        me.perm_state ?? '',
          perm_pincode:      me.perm_pincode ?? '',
        }));
      }
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [id, user]);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSameAddr = (e) => {
    setSameAddr(e.target.checked);
    if (e.target.checked) {
      setForm(f => ({
        ...f,
        perm_address: f.temp_address,
        perm_city:    f.temp_city,
        perm_state:   f.temp_state,
        perm_pincode: f.temp_pincode,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.room || !form.check_in_date || !form.check_out_date) {
      setMessage({ type: 'error', text: 'Please select a room and enter dates.' });
      return;
    }
    setSubmitting(true);
    try {
      // 1. Update student profile
      if (student) {
        await api.patch(`/students/${student.id}/`, {
          registration_no:   form.registration_no,
          course:            form.course,
          middle_name:       form.middle_name,
          gender:            form.gender,
          phone:             form.phone,
          guardian_name:     form.guardian_name,
          guardian_relation: form.guardian_relation,
          guardian_contact:  form.guardian_contact,
          temp_address:      form.temp_address,
          temp_city:         form.temp_city,
          temp_state:        form.temp_state,
          temp_pincode:      form.temp_pincode,
          perm_address:      form.perm_address,
          perm_city:         form.perm_city,
          perm_state:        form.perm_state,
          perm_pincode:      form.perm_pincode,
        });
      }

      // 2. Create booking
      await api.post('/bookings/bookings/', {
        student:        student?.id,
        room:           form.room,
        check_in_date:  form.check_in_date,
        check_out_date: form.check_out_date,
        total_amount:   form.total_amount || null,
      });

      setMessage({ type: 'success', text: 'Booking submitted successfully! Awaiting approval.' });
      setTimeout(() => navigate('/students/homepage'), 2000);
    } catch (err) {
      const data = err.response?.data;
      const msg  = data ? Object.values(data).flat().join(', ') : 'Booking failed.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="w-5 h-5 animate-spin text-cyan-500 mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Loading...
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">

      {/* Back + Title */}
      <div>
        <button onClick={() => navigate('/students/hostels')}
          className="text-sm text-gray-500 hover:text-cyan-400 transition mb-3 flex items-center gap-1">
          ← Back to Hostels
        </button>
        <h1 className="text-2xl font-bold text-white">Hostel Booking Form</h1>
        <p className="text-gray-500 text-sm mt-1">{hostel?.name} — {hostel?.address}</p>
      </div>

      {/* Alert */}
      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border-green-500/30'
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Room Info */}
        <Section title="Room Info">
          <Field label="Select Room" required>
            <select value={form.room} onChange={set('room')} className={inputCls} required>
              <option value="">Choose a room</option>
              {rooms.filter(r => r.current_occupancy < r.capacity).map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} — {r.room_type} ({r.current_occupancy}/{r.capacity} occupied)
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Check-in Date" required>
              <input type="date" value={form.check_in_date} onChange={set('check_in_date')}
                className={inputCls} required />
            </Field>
            <Field label="Check-out Date" required>
              <input type="date" value={form.check_out_date} onChange={set('check_out_date')}
                className={inputCls} required />
            </Field>
          </div>
          <Field label="Total Amount (optional)">
            <input type="number" value={form.total_amount} onChange={set('total_amount')}
              placeholder="Leave blank for admin to set" className={inputCls} />
          </Field>
        </Section>

        {/* Personal Info */}
        <Section title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Registration No">
              <input type="text" value={form.registration_no} onChange={set('registration_no')}
                placeholder="e.g. CS2024051" className={inputCls} />
            </Field>
            <Field label="Course">
              <input type="text" value={form.course} onChange={set('course')}
                placeholder="e.g. B.Tech CSE" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="First Name" required>
              <input type="text"
                value={user?.full_name?.split(' ')[0] ?? ''}
                className={inputCls + ' opacity-60'} readOnly />
            </Field>
            <Field label="Middle Name">
              <input type="text" value={form.middle_name} onChange={set('middle_name')}
                className={inputCls} />
            </Field>
            <Field label="Last Name" required>
              <input type="text"
                value={user?.full_name?.split(' ').slice(-1)[0] ?? ''}
                className={inputCls + ' opacity-60'} readOnly />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Gender" required>
              <select value={form.gender} onChange={set('gender')} className={inputCls} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Email ID">
              <input type="email" value={user?.email ?? ''} className={inputCls + ' opacity-60'} readOnly />
            </Field>
            <Field label="Contact No" required>
              <input type="tel" value={form.phone} onChange={set('phone')}
                placeholder="Phone number" className={inputCls} required />
            </Field>
          </div>
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Guardian Name" required>
              <input type="text" value={form.guardian_name} onChange={set('guardian_name')}
                className={inputCls} required />
            </Field>
            <Field label="Relation" required>
              <input type="text" value={form.guardian_relation} onChange={set('guardian_relation')}
                placeholder="e.g. Father" className={inputCls} required />
            </Field>
            <Field label="Contact No" required>
              <input type="tel" value={form.guardian_contact} onChange={set('guardian_contact')}
                className={inputCls} required />
            </Field>
          </div>
        </Section>

        {/* Temporary Address */}
        <Section title="Temporary Address">
          <Field label="Address">
            <input type="text" value={form.temp_address} onChange={set('temp_address')}
              placeholder="Street / Area" className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City">
              <input type="text" value={form.temp_city} onChange={set('temp_city')} className={inputCls} />
            </Field>
            <Field label="State">
              <input type="text" value={form.temp_state} onChange={set('temp_state')} className={inputCls} />
            </Field>
            <Field label="Pincode">
              <input type="text" value={form.temp_pincode} onChange={set('temp_pincode')} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Permanent Address */}
        <Section title="Permanent Address">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sameAddr} onChange={handleSameAddr}
              className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-cyan-500" />
            <span className="text-sm text-gray-400">Same as temporary address</span>
          </label>
          {!sameAddr && (
            <>
              <Field label="Address">
                <input type="text" value={form.perm_address} onChange={set('perm_address')}
                  placeholder="Street / Area" className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="City">
                  <input type="text" value={form.perm_city} onChange={set('perm_city')} className={inputCls} />
                </Field>
                <Field label="State">
                  <input type="text" value={form.perm_state} onChange={set('perm_state')} className={inputCls} />
                </Field>
                <Field label="Pincode">
                  <input type="text" value={form.perm_pincode} onChange={set('perm_pincode')} className={inputCls} />
                </Field>
              </div>
            </>
          )}
        </Section>

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl transition disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Booking Application'}
        </button>

      </form>
    </div>
  );
};

export default RoomDetails;