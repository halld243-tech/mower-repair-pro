import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/customers/${id}`).then(res => setCustomer(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return <div className="text-center py-12 text-gray-500">Customer not found</div>;

  return (
    <div>
      <Link to="/admin/customers" className="text-sm text-green-600 hover:underline mb-4 inline-block">← Back to Customers</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{customer.name}</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Contact Info</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Email</dt><dd>{customer.email}</dd></div>
          <div><dt className="text-gray-500">Phone</dt><dd>{customer.phone || '—'}</dd></div>
          <div className="col-span-2"><dt className="text-gray-500">Address</dt><dd>{customer.address || '—'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Mowers ({customer.mowers?.length || 0})</h2>
        {customer.mowers?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {customer.mowers.map(m => (
              <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">🚜 {m.make} {m.model} {m.year ? `(${m.year})` : ''}</p>
                {m.serialNumber && <p className="text-xs text-gray-500">S/N: {m.serialNumber}</p>}
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500">No mowers</p>}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Repair Jobs ({customer.repairJobs?.length || 0})</h2>
        {customer.repairJobs?.length > 0 ? (
          <div className="space-y-3">
            {customer.repairJobs.map(job => (
              <Link key={job.id} to={`/admin/jobs/${job.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Job #{job.id} — {job.mower?.make} {job.mower?.model}</p>
                    <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500">No jobs</p>}
      </div>
    </div>
  );
}
