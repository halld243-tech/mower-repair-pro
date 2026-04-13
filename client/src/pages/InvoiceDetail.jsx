import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/${id}`).then(res => setInvoice(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div className="text-center py-12 text-gray-500">Invoice not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/invoices" className="text-sm text-green-600 hover:underline mb-4 inline-block">← Back to Invoices</Link>

      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice #{invoice.id}</h1>
            <p className="text-sm text-gray-500">Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="border-t pt-4 mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Customer</h3>
          <p className="text-sm">{invoice.customer?.name}</p>
          <p className="text-sm text-gray-500">{invoice.customer?.email}</p>
        </div>

        <div className="border-t pt-4 mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Repair Job</h3>
          <p className="text-sm">{invoice.repairJob?.mower?.make} {invoice.repairJob?.mower?.model}</p>
          {invoice.repairJob?.parts?.length > 0 && (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 text-gray-500">Part</th>
                  <th className="text-right py-1 text-gray-500">Qty</th>
                  <th className="text-right py-1 text-gray-500">Cost</th>
                </tr>
              </thead>
              <tbody>
                {invoice.repairJob.parts.map(p => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-1">{p.name}</td>
                    <td className="py-1 text-right">{p.quantityOrdered}</td>
                    <td className="py-1 text-right">${(p.unitCost * p.quantityOrdered).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Labor</span>
            <span>${invoice.laborCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Parts</span>
            <span>${invoice.partsCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-green-700">${invoice.totalCost.toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t mt-4 pt-4">
            <p className="text-sm text-gray-500">Notes: {invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
