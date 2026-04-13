import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MowerDetail() {
  const { id } = useParams();
  const [mower, setMower] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/mowers/${id}`).then(res => setMower(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!mower) return <div className="text-center py-12 text-gray-500">Mower not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/mowers" className="text-sm text-green-600 hover:underline mb-4 inline-block">← Back to Mowers</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{mower.make} {mower.model}</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Make</dt><dd className="font-medium">{mower.make}</dd></div>
          <div><dt className="text-gray-500">Model</dt><dd className="font-medium">{mower.model}</dd></div>
          {mower.year && <div><dt className="text-gray-500">Year</dt><dd className="font-medium">{mower.year}</dd></div>}
          {mower.serialNumber && <div><dt className="text-gray-500">Serial Number</dt><dd className="font-medium">{mower.serialNumber}</dd></div>}
          {mower.notes && <div className="col-span-2"><dt className="text-gray-500">Notes</dt><dd>{mower.notes}</dd></div>}
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Service History</h2>
        {mower.repairJobs?.length === 0 ? (
          <p className="text-gray-500 text-sm">No service history</p>
        ) : (
          <div className="space-y-3">
            {mower.repairJobs?.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Job #{job.id}</p>
                    <p className="text-xs text-gray-500 truncate max-w-md">{job.description}</p>
                    <p className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
