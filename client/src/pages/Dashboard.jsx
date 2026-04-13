import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/jobs'), api.get('/invoices')])
      .then(([jobsRes, invRes]) => {
        setJobs(jobsRes.data);
        setInvoices(invRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeJobs = jobs.filter(j => !['COMPLETED', 'CANCELLED'].includes(j.status));
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500 uppercase">Active Jobs</h3>
          <p className="text-3xl font-bold text-green-600">{activeJobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500 uppercase">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-800">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500 uppercase">Pending Invoices</h3>
          <p className="text-3xl font-bold text-orange-600">{invoices.filter(i => i.status !== 'PAID').length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Repairs</h2>
            <Link to="/jobs" className="text-sm text-green-600 hover:underline">View all →</Link>
          </div>
          {activeJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No active repairs</p>
          ) : (
            <div className="space-y-3">
              {activeJobs.slice(0, 5).map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{job.mower?.make} {job.mower?.model}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{job.description}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
            <Link to="/invoices" className="text-sm text-green-600 hover:underline">View all →</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map(inv => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Invoice #{inv.id}</p>
                      <p className="text-xs text-gray-500">${inv.totalCost.toFixed(2)}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/request" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
          🔧 Request a Repair
        </Link>
      </div>
    </div>
  );
}
