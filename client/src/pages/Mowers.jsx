import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Mowers() {
  const [mowers, setMowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mowers').then(res => setMowers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Mowers</h1>
      </div>

      {mowers.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500">No mowers registered yet.</p>
          <Link to="/request" className="mt-4 inline-block text-green-600 hover:underline">Add one with a repair request →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mowers.map(m => (
            <Link key={m.id} to={`/mowers/${m.id}`} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-2">🚜</div>
              <h3 className="font-semibold text-gray-800">{m.make} {m.model}</h3>
              {m.year && <p className="text-sm text-gray-500">Year: {m.year}</p>}
              {m.serialNumber && <p className="text-sm text-gray-500">S/N: {m.serialNumber}</p>}
              <p className="text-xs text-gray-400 mt-2">Added {new Date(m.createdAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
