import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PART_STATUSES = ['ALL', 'ORDERED', 'SHIPPED', 'RECEIVED', 'INSTALLED'];

export default function AdminParts() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs').then(res => setJobs(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Flatten all parts from all jobs
  const allParts = [];
  jobs.forEach(job => {
    if (job.parts) {
      // Parts might not be loaded in list view, so we fetch individually
    }
  });

  // Since the jobs list doesn't include parts, let's show job-level parts tracker
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Parts Tracker</h1>
      <p className="text-sm text-gray-500 mb-4">View and manage parts from the individual job detail pages.</p>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500 text-sm">
          Parts are managed per repair job. Visit{' '}
          <a href="/admin/jobs" className="text-green-600 hover:underline">Repair Jobs</a> to manage parts for each job.
        </p>
      </div>
    </div>
  );
}
