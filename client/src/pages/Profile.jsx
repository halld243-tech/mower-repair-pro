import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => setProfile(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="font-medium">{profile?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-medium">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Role</dt>
            <dd className="font-medium">{profile?.role}</dd>
          </div>
          {profile?.phone && (
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="font-medium">{profile?.phone}</dd>
            </div>
          )}
          {profile?.address && (
            <div>
              <dt className="text-sm text-gray-500">Address</dt>
              <dd className="font-medium">{profile?.address}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-gray-500">Member Since</dt>
            <dd className="font-medium">{new Date(profile?.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
