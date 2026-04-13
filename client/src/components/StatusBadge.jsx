const STATUS_COLORS = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  DIAGNOSED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  READY: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  ORDERED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  INSTALLED: 'bg-green-200 text-green-900',
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
