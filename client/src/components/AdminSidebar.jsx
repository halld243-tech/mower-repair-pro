import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/jobs', label: 'Repair Jobs', icon: '🔧' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/mowers', label: 'Mowers', icon: '🚜' },
  { to: '/admin/parts', label: 'Parts', icon: '⚙️' },
  { to: '/admin/invoices', label: 'Invoices', icon: '💰' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link to="/admin" className="text-xl font-bold text-green-400">🌿 Mower Repair Pro</Link>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors ${
              location.pathname === link.to
                ? 'bg-green-700 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="w-full text-sm bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white">
          Logout
        </button>
      </div>
    </div>
  );
}
