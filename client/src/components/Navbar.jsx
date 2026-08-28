import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-xl font-bold text-green-400">
              🌿 Mower Repair Pro
            </Link>
            {user.role === 'CUSTOMER' && (
              <div className="hidden md:flex space-x-3 ml-6">
                <Link to="/dashboard" className="hover:text-green-400 px-3 py-2 rounded text-sm">Dashboard</Link>
                <Link to="/jobs" className="hover:text-green-400 px-3 py-2 rounded text-sm">My Jobs</Link>
                <Link to="/mowers" className="hover:text-green-400 px-3 py-2 rounded text-sm">My Mowers</Link>
                <Link to="/invoices" className="hover:text-green-400 px-3 py-2 rounded text-sm">Invoices</Link>
                <Link to="/request" className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium">Request Repair</Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-sm hover:text-green-400">{user.name}</Link>
            <button onClick={handleLogout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
