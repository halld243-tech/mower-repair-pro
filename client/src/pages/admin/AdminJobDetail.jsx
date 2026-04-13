import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const JOB_STATUSES = ['SUBMITTED', 'DIAGNOSED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'];
const PART_STATUSES = ['ORDERED', 'SHIPPED', 'RECEIVED', 'INSTALLED'];

export default function AdminJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [techNotes, setTechNotes] = useState('');
  const [newPart, setNewPart] = useState({ name: '', partNumber: '', supplier: '', quantityOrdered: 1, unitCost: 0 });
  const [showAddPart, setShowAddPart] = useState(false);
  const [laborCost, setLaborCost] = useState('');

  const fetchJob = () => {
    api.get(`/jobs/${id}`).then(res => {
      setJob(res.data);
      setTechNotes(res.data.techNotes || '');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJob(); }, [id]);

  const updateStatus = async (status) => {
    try {
      await api.put(`/jobs/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchJob();
    } catch { toast.error('Failed to update status'); }
  };

  const saveTechNotes = async () => {
    try {
      await api.put(`/jobs/${id}`, { techNotes });
      toast.success('Tech notes saved');
      fetchJob();
    } catch { toast.error('Failed to save notes'); }
  };

  const addPart = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jobs/${id}/parts`, newPart);
      toast.success('Part added');
      setShowAddPart(false);
      setNewPart({ name: '', partNumber: '', supplier: '', quantityOrdered: 1, unitCost: 0 });
      fetchJob();
    } catch { toast.error('Failed to add part'); }
  };

  const updatePartStatus = async (partId, status) => {
    try {
      await api.put(`/parts/${partId}`, { status });
      toast.success('Part status updated');
      fetchJob();
    } catch { toast.error('Failed to update part'); }
  };

  const createInvoice = async () => {
    try {
      await api.post(`/jobs/${id}/invoice`, { laborCost: parseFloat(laborCost) || 0 });
      toast.success('Invoice created');
      fetchJob();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create invoice'); }
  };

  const updateInvoiceStatus = async (status) => {
    try {
      await api.put(`/invoices/${job.invoice.id}`, { status });
      toast.success('Invoice status updated');
      fetchJob();
    } catch { toast.error('Failed to update invoice'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  return (
    <div>
      <Link to="/admin/jobs" className="text-sm text-green-600 hover:underline mb-4 inline-block">← Back to Jobs</Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job #{job.id}</h1>
        <StatusBadge status={job.status} />
      </div>

      {/* Job Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Customer</dt><dd className="font-medium">{job.customer?.name} ({job.customer?.email})</dd></div>
            <div><dt className="text-gray-500">Mower</dt><dd className="font-medium">{job.mower?.make} {job.mower?.model}</dd></div>
            <div><dt className="text-gray-500">Description</dt><dd>{job.description}</dd></div>
            <div><dt className="text-gray-500">Submitted</dt><dd>{new Date(job.createdAt).toLocaleString()}</dd></div>
          </dl>
        </div>

        {/* Status Control */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {JOB_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={job.status === s}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  job.status === s ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } disabled:opacity-50`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Notes */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Technician Notes</h2>
        <textarea
          value={techNotes}
          onChange={(e) => setTechNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
          placeholder="Add diagnostic findings, repair notes..."
        />
        <button onClick={saveTechNotes} className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
          Save Notes
        </button>
      </div>

      {/* Parts */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Parts ({job.parts?.length || 0})</h2>
          <button onClick={() => setShowAddPart(!showAddPart)} className="text-sm text-green-600 hover:underline">
            {showAddPart ? 'Cancel' : '+ Add Part'}
          </button>
        </div>

        {showAddPart && (
          <form onSubmit={addPart} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Part name *" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className="px-3 py-2 border rounded text-sm" required />
              <input placeholder="Part number" value={newPart.partNumber} onChange={e => setNewPart({...newPart, partNumber: e.target.value})} className="px-3 py-2 border rounded text-sm" />
              <input placeholder="Supplier" value={newPart.supplier} onChange={e => setNewPart({...newPart, supplier: e.target.value})} className="px-3 py-2 border rounded text-sm" />
              <input type="number" placeholder="Qty" value={newPart.quantityOrdered} onChange={e => setNewPart({...newPart, quantityOrdered: parseInt(e.target.value)})} className="px-3 py-2 border rounded text-sm" min="1" />
              <input type="number" step="0.01" placeholder="Unit cost" value={newPart.unitCost} onChange={e => setNewPart({...newPart, unitCost: parseFloat(e.target.value)})} className="px-3 py-2 border rounded text-sm" min="0" />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Add Part</button>
          </form>
        )}

        {job.parts?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 text-gray-500">Part</th>
                <th className="text-left py-2 text-gray-500">Supplier</th>
                <th className="text-center py-2 text-gray-500">Qty</th>
                <th className="text-right py-2 text-gray-500">Cost</th>
                <th className="text-center py-2 text-gray-500">Status</th>
                <th className="text-right py-2 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {job.parts.map(p => (
                <tr key={p.id}>
                  <td className="py-2">{p.name} {p.partNumber ? `(${p.partNumber})` : ''}</td>
                  <td className="py-2 text-gray-500">{p.supplier || '—'}</td>
                  <td className="py-2 text-center">{p.quantityOrdered}</td>
                  <td className="py-2 text-right">${(p.unitCost * p.quantityOrdered).toFixed(2)}</td>
                  <td className="py-2 text-center"><StatusBadge status={p.status} /></td>
                  <td className="py-2 text-right">
                    <select
                      value={p.status}
                      onChange={(e) => updatePartStatus(p.id, e.target.value)}
                      className="text-xs border rounded px-1 py-0.5"
                    >
                      {PART_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-500">No parts added</p>}
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Invoice</h2>
        {job.invoice ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Invoice #{job.invoice.id}</span>
              <StatusBadge status={job.invoice.status} />
            </div>
            <dl className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div><dt className="text-gray-500">Labor</dt><dd className="font-medium">${job.invoice.laborCost.toFixed(2)}</dd></div>
              <div><dt className="text-gray-500">Parts</dt><dd className="font-medium">${job.invoice.partsCost.toFixed(2)}</dd></div>
              <div><dt className="text-gray-500">Total</dt><dd className="font-bold text-green-700">${job.invoice.totalCost.toFixed(2)}</dd></div>
            </dl>
            <div className="flex gap-2">
              {['DRAFT', 'SENT', 'PAID'].map(s => (
                <button
                  key={s}
                  onClick={() => updateInvoiceStatus(s)}
                  disabled={job.invoice.status === s}
                  className={`px-3 py-1 rounded text-xs ${job.invoice.status === s ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">No invoice yet. Create one:</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                placeholder="Labor cost"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              />
              <button onClick={createInvoice} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                Create Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
