import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customers</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link to={`/admin/customers/${c.id}`} className="text-green-600 hover:underline font-medium">{c.name}</Link>
                </td>
                <td className="px-6 py-4 text-sm">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
