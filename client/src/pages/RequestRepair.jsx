import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RequestRepair() {
  const [mowers, setMowers] = useState([]);
  const [selectedMower, setSelectedMower] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewMower, setShowNewMower] = useState(false);
  const [newMower, setNewMower] = useState({ make: '', model: '', year: '', serialNumber: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/mowers').then(res => {
      setMowers(res.data);
      if (res.data.length > 0) setSelectedMower(res.data[0].id.toString());
    }).finally(() => setLoading(false));
  }, []);

  const handleAddMower = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/mowers', newMower);
      setMowers([res.data, ...mowers]);
      setSelectedMower(res.data.id.toString());
      setShowNewMower(false);
      toast.success('Mower added!');
    } catch (err) {
      toast.error('Failed to add mower');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMower) return toast.error('Please select a mower');
    setSubmitting(true);
    try {
      await api.post('/jobs', { mowerId: parseInt(selectedMower), description });
      toast.success('Repair request submitted!');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Request a Repair</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Mower</label>
            {mowers.length > 0 ? (
              <select
                value={selectedMower}
                onChange={(e) => setSelectedMower(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {mowers.map(m => (
                  <option key={m.id} value={m.id}>{m.make} {m.model} {m.year ? `(${m.year})` : ''}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No mowers registered. Add one below.</p>
            )}
            <button type="button" onClick={() => setShowNewMower(!showNewMower)} className="mt-2 text-sm text-green-600 hover:underline">
              {showNewMower ? 'Cancel' : '+ Add a new mower'}
            </button>
          </div>

          {showNewMower && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium text-sm">New Mower</h3>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Make *" value={newMower.make} onChange={e => setNewMower({...newMower, make: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" required />
                <input placeholder="Model *" value={newMower.model} onChange={e => setNewMower({...newMower, model: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" required />
                <input placeholder="Year" value={newMower.year} onChange={e => setNewMower({...newMower, year: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Serial Number" value={newMower.serialNumber} onChange={e => setNewMower({...newMower, serialNumber: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <button type="button" onClick={handleAddMower} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Add Mower</button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Issue *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Describe the problem with your mower..."
              required
            />
          </div>

          <button type="submit" disabled={submitting || !selectedMower} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Repair Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
