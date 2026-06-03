import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../components/Auth';

const inputCls =
  'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition';

const labelCls =
  'block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2';

const Section = ({ title, icon, children }) => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 space-y-5">
    <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
      {icon && <span className="text-2xl">{icon}</span>}
      <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className={labelCls}>
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hostel, setHostel] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sameAddr, setSameAddr] = useState(false);

  const [form, setForm] = useState({
    room: '',
    check_in_date: '',
    check_out_date: '',
    middle_name: '',
    gender: '',
    phone: '',
    guardian_name: '',
    guardian_relation: '',
    guardian_contact: '',
    temp_address: '',
    temp_city: '',
    temp_state: '',
    perm_address: '',
    perm_city: '',
    perm_state: '',
  });

  useEffect(() => {
    if (!id) {
      setMessage({ type: 'error', text: 'No hostel selected. Please go back and select a hostel.' });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [hostelRes, blockRes, floorRes, roomRes, studentRes] = await Promise.all([
          api.get(`/hostel/hostels/${id}/`),
          api.get('/hostel/blocks/'),
          api.get('/hostel/floors/'),
          api.get('/hostel/rooms/'),
          api.get('/students/'),
        ]);

        const hostelData = hostelRes.data;
        const blockData = blockRes.data.results ?? blockRes.data;
        const floorData = floorRes.data.results ?? floorRes.data;
        const roomData = roomRes.data.results ?? roomRes.data;
        const studentData = studentRes.data.results ?? studentRes.data;

        setHostel(hostelData);

        const hostelBlocks = blockData.filter(b => String(b.hostel) === String(id));
        setBlocks(hostelBlocks);

        const hostelBlockIds = hostelBlocks.map(b => b.id);
        const hostelFloors = floorData.filter(f => {
          const blockId = typeof f.block === 'object' ? f.block.id : f.block;
          return hostelBlockIds.includes(blockId);
        });
        setFloors(hostelFloors);
        setRooms(roomData);

        const me = studentData.find(s => s.user === user?.id);
        if (me) {
          setStudent(me);
          setForm(prev => ({
            ...prev,
            middle_name: me.middle_name ?? '',
            gender: me.gender ?? '',
            phone: me.phone ?? '',
            guardian_name: me.guardian_name ?? '',
            guardian_relation: me.guardian_relation ?? '',
            guardian_contact: me.guardian_contact ?? '',
            temp_address: me.temp_address ?? '',
            temp_city: me.temp_city ?? '',
            temp_state: me.temp_state ?? '',
            perm_address: me.perm_address ?? '',
            perm_city: me.perm_city ?? '',
            perm_state: me.perm_state ?? '',
          }));
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load hostel details. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const filteredFloors = floors.filter(f => {
    const blockId = typeof f.block === 'object' ? f.block.id : f.block;
    return String(blockId) === String(selectedBlock);
  });

  const filteredRooms = rooms.filter(r => 
    String(r.floor) === String(selectedFloor) && r.current_occupancy < r.capacity
  );

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSameAddr = (e) => {
    setSameAddr(e.target.checked);
    if (e.target.checked) {
      setForm(prev => ({
        ...prev,
        perm_address: prev.temp_address,
        perm_city: prev.temp_city,
        perm_state: prev.temp_state,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date().toISOString().split('T')[0];
    
    if (!form.room) {
      return setMessage({ type: 'error', text: 'Please select a room.' });
    }
    if (!form.check_in_date) {
      return setMessage({ type: 'error', text: 'Please select check-in date.' });
    }
    if (!form.check_out_date) {
      return setMessage({ type: 'error', text: 'Please select check-out date.' });
    }
    if (form.check_in_date < today) {
      return setMessage({ type: 'error', text: 'Check-in date cannot be in the past.' });
    }
    if (form.check_out_date <= form.check_in_date) {
      return setMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
    }

    setSubmitting(true);

    try {
      let studentId = student?.id;
      
      if (!studentId) {
        const studentData = {
          user: user.id,
          middle_name: form.middle_name || null,
          gender: form.gender || null,
          phone: form.phone || null,
          guardian_name: form.guardian_name || null,
          guardian_relation: form.guardian_relation || null,
          guardian_contact: form.guardian_contact || null,
          temp_address: form.temp_address || null,
          temp_city: form.temp_city || null,
          temp_state: form.temp_state || null,
          perm_address: form.perm_address || null,
          perm_city: form.perm_city || null,
          perm_state: form.perm_state || null,
        };
        
        console.log('Creating student:', studentData);
        const studentResponse = await api.post('/students/', studentData);
        studentId = studentResponse.data.id;
        setStudent(studentResponse.data);
      } else {
        await api.patch(`/students/${student.id}/`, {
          middle_name: form.middle_name || null,
          gender: form.gender || null,
          phone: form.phone || null,
          guardian_name: form.guardian_name || null,
          guardian_relation: form.guardian_relation || null,
          guardian_contact: form.guardian_contact || null,
          temp_address: form.temp_address || null,
          temp_city: form.temp_city || null,
          temp_state: form.temp_state || null,
          perm_address: form.perm_address || null,
          perm_city: form.perm_city || null,
          perm_state: form.perm_state || null,
        });
      }

      await api.post('/bookings/bookings/', {
        student: studentId,
        room: parseInt(form.room),
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
      });

      setMessage({ type: 'success', text: 'Booking submitted successfully!' });
      
      setTimeout(() => {
        navigate('/students/homepage');
      }, 2000);
      
    } catch (err) {
      console.error('Submit error:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          setMessage({ 
            type: 'error', 
            text: Array.isArray(firstError) ? firstError[0] : firstError 
          });
        } else {
          setMessage({ type: 'error', text: errorData });
        }
      } else {
        setMessage({ type: 'error', text: 'Booking failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400 py-12">Loading hostel details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div>
        <button
          onClick={() => navigate('/students/book-hostels')}
          className="text-gray-400 hover:text-cyan-400 mb-4 flex items-center gap-1 text-sm transition"
        >
          ← Back to Hostels
        </button>
        <h1 className="text-3xl font-bold text-white">{hostel?.name || 'Hostel Details'}</h1>
        <p className="text-gray-400 mt-2">{hostel?.address}</p>
      </div>

      {message.text && (
        <div
          className={`px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Section title="Select Room" icon="🏨">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Block" required>
              <select
                className={inputCls}
                value={selectedBlock}
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  setSelectedFloor('');
                  setForm(prev => ({ ...prev, room: '' }));
                }}
                required
              >
                <option value="">Select block</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Floor" required>
              <select
                className={inputCls}
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  setForm(prev => ({ ...prev, room: '' }));
                }}
                required
                disabled={!selectedBlock}
              >
                <option value="">{!selectedBlock ? 'Select block first' : 'Select floor'}</option>
                {filteredFloors.map((f) => (
                  <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
                ))}
              </select>
            </Field>

            <Field label="Room" required>
              <select
                className={inputCls}
                value={form.room}
                onChange={set('room')}
                required
                disabled={!selectedFloor}
              >
                <option value="">{!selectedFloor ? 'Select floor first' : 'Select room'}</option>
                {filteredRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} ({r.room_type}) — {r.current_occupancy}/{r.capacity}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {filteredRooms.length === 0 && selectedFloor && (
            <p className="text-yellow-500 text-sm mt-2">No available rooms on this floor.</p>
          )}
        </Section>

        <Section title="Booking Dates" icon="📅">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Check-in" required>
              <input
                type="date"
                className={inputCls}
                value={form.check_in_date}
                onChange={set('check_in_date')}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Field>
            <Field label="Check-out" required>
              <input
                type="date"
                className={inputCls}
                value={form.check_out_date}
                onChange={set('check_out_date')}
                min={form.check_in_date || new Date().toISOString().split('T')[0]}
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Personal Information" icon="👤">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="First Name">
              <input
                type="text"
                className={`${inputCls} opacity-60`}
                value={user?.full_name?.split(' ')[0] ?? ''}
                readOnly
              />
            </Field>
            <Field label="Middle Name">
              <input
                type="text"
                className={inputCls}
                value={form.middle_name}
                onChange={set('middle_name')}
              />
            </Field>
            <Field label="Last Name">
              <input
                type="text"
                className={`${inputCls} opacity-60`}
                value={user?.full_name?.split(' ').slice(-1)[0] ?? ''}
                readOnly
              />
            </Field>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Gender" required>
              <select
                className={inputCls}
                value={form.gender}
                onChange={set('gender')}
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={`${inputCls} opacity-60`}
                value={user?.email ?? ''}
                readOnly
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                className={inputCls}
                value={form.phone}
                onChange={set('phone')}
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Emergency Contact" icon="🚨">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Guardian Name" required>
              <input
                type="text"
                className={inputCls}
                value={form.guardian_name}
                onChange={set('guardian_name')}
                required
              />
            </Field>
            <Field label="Relation" required>
              <input
                type="text"
                className={inputCls}
                value={form.guardian_relation}
                onChange={set('guardian_relation')}
                required
              />
            </Field>
            <Field label="Guardian Contact" required>
              <input
                type="tel"
                className={inputCls}
                value={form.guardian_contact}
                onChange={set('guardian_contact')}
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Temporary Address" icon="📍">
          <Field label="Address">
            <input
              type="text"
              className={inputCls}
              value={form.temp_address}
              onChange={set('temp_address')}
            />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="City">
              <input
                type="text"
                className={inputCls}
                value={form.temp_city}
                onChange={set('temp_city')}
              />
            </Field>
            <Field label="State">
              <input
                type="text"
                className={inputCls}
                value={form.temp_state}
                onChange={set('temp_state')}
              />
            </Field>
          </div>
        </Section>

        <Section title="Permanent Address" icon="🏠">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAddr}
              onChange={handleSameAddr}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400">Same as temporary address</span>
          </label>
          {!sameAddr && (
            <>
              <Field label="Address">
                <input
                  type="text"
                  className={inputCls}
                  value={form.perm_address}
                  onChange={set('perm_address')}
                />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="City">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.perm_city}
                    onChange={set('perm_city')}
                  />
                </Field>
                <Field label="State">
                  <input
                    type="text"
                    className={inputCls}
                    value={form.perm_state}
                    onChange={set('perm_state')}
                  />
                </Field>
              </div>
            </>
          )}
        </Section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold rounded-xl transition"
        >
          {submitting ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};

export default RoomDetails;