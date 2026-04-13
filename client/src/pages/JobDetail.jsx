import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(res => setJob(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  const statusSteps = ['SUBMITTED', 'DIAGNOSED', 'IN_PROGRESS', 'READY', 'COMPLETED'];
  const currentIdx = statusSteps.indexOf(job.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="text-sm text-green-600 hover:underline mb-4 inline-block">← Back to Jobs</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job #{job.id}</h1>
        <StatusBadge status={job.status} />
      </div>

      {/* Status Timeline */}
      {job.status !== 'CANCELLED' && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Progress</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>{i + 1}</div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {statusSteps.map(s => (
              <span key={s} className="text-xs text-gray-500">{s.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Mower</dt><dd className="font-medium">{job.mower?.make} {job.mower?.model} {job.mower?.year ? `(${job.mower.year})` : ''}</dd></div>
            <div><dt className="text-gray-500">Description</dt><dd>{job.description}</dd></div>
            <div><dt className="text-gray-500">Submitted</dt><dd>{new Date(job.createdAt).toLocaleString()}</dd></div>
            {job.completedAt && <div><dt className="text-gray-500">Completed</dt><dd>{new Date(job.completedAt).toLocaleString()}</dd></div>}
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Technician Notes</h2>
          {job.techNotes ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.techNotes}</p>
          ) : (
            <p className="text-sm text-gray-400">No tech notes yet</p>
          )}
        </div>
      </div>

      {/* Parts */}
      {job.parts && job.parts.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">Parts</h2>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 text-gray-500">Part</th>
                <th className="text-left py-2 text-gray-500">Status</th>
                <th className="text-right py-2 text-gray-500">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {job.parts.map(p => (
                <tr key={p.id}>
                  <td className="py-2">{p.name} {p.partNumber ? `(${p.partNumber})` : ''}</td>
                  <td className="py-2"><StatusBadge status={p.status} /></td>
                  <td className="py-2 text-right">${(p.unitCost * p.quantityOrdered).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice */}
      {job.invoice && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Invoice</h2>
            <StatusBadge status={job.invoice.status} />
          </div>
          <dl className="grid grid-cols-3 gap-4 text-sm">
            <div><dt className="text-gray-500">Labor</dt><dd className="font-medium">${job.invoice.laborCost.toFixed(2)}</dd></div>
            <div><dt className="text-gray-500">Parts</dt><dd className="font-medium">${job.invoice.partsCost.toFixed(2)}</dd></div>
            <div><dt className="text-gray-500">Total</dt><dd className="font-bold text-lg text-green-700">${job.invoice.totalCost.toFixed(2)}</dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}
