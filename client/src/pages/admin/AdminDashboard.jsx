import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/jobs'), api.get('/invoices'), api.get('/customers')])
      .then(([j, i, c]) => { setJobs(j.data); setInvoices(i.data); setCustomers(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const statusCounts = {};
  jobs.forEach(j => { statusCounts[j.status] = (statusCounts[j.status] || 0) + 1; });
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totalCost, 0);
  const pendingRevenue = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.totalCost, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-xs text-gray-500 uppercase">Total Jobs</h3>
          <p className="text-2xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-xs text-gray-500 uppercase">Customers</h3>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-xs text-gray-500 uppercase">Revenue</h3>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-xs text-gray-500 uppercase">Pending</h3>
          <p className="text-2xl font-bold text-orange-600">${pendingRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Jobs by Status */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Jobs by Status</h2>
        <div className="flex flex-wrap gap-3">
          {['SUBMITTED', 'DIAGNOSED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'].map(s => (
            <div key={s} className="flex items-center space-x-2">
              <StatusBadge status={s} />
              <span className="text-sm font-medium">{statusCounts[s] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Jobs</h2>
            <Link to="/admin/jobs" className="text-sm text-green-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => (
              <Link key={job.id} to={`/admin/jobs/${job.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">#{job.id} - {job.customer?.name}</p>
                    <p className="text-xs text-gray-500">{job.mower?.make} {job.mower?.model}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            <Link to="/admin/invoices" className="text-sm text-green-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Invoice #{inv.id} - {inv.customer?.name}</p>
                    <p className="text-xs text-gray-500">${inv.totalCost.toFixed(2)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
