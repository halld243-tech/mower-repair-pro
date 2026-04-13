import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminMowers() {
  const [mowers, setMowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mowers').then(res => setMowers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Mowers</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mowers.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">#{m.id}</td>
                <td className="px-6 py-4 font-medium text-sm">{m.make} {m.model}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.year || '—'}</td>
                <td className="px-6 py-4 text-sm">
                  <Link to={`/admin/customers/${m.customer?.id}`} className="text-green-600 hover:underline">
                    {m.customer?.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.serialNumber || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
