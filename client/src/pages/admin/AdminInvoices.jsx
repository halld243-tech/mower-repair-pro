import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const INV_STATUSES = ['ALL', 'DRAFT', 'SENT', 'PAID'];

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    api.get('/invoices').then(res => setInvoices(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvoices(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/invoices/${id}`, { status });
      toast.success('Invoice updated');
      fetchInvoices();
    } catch { toast.error('Failed to update invoice'); }
  };

  if (loading) return <LoadingSpinner />;

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Invoices</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {INV_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mower</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{inv.id}</td>
                <td className="px-6 py-4 text-sm">{inv.customer?.name}</td>
                <td className="px-6 py-4 text-sm">{inv.repairJob?.mower?.make} {inv.repairJob?.mower?.model}</td>
                <td className="px-6 py-4 text-right font-medium">${inv.totalCost.toFixed(2)}</td>
                <td className="px-6 py-4 text-center"><StatusBadge status={inv.status} /></td>
                <td className="px-6 py-4 text-right">
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {['DRAFT', 'SENT', 'PAID'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No invoices found</div>
        )}
      </div>
    </div>
  );
}
