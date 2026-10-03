import { useState, useEffect } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';

const PAYMENTS_API_URL = 'http://localhost:8080/api/payments';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(PAYMENTS_API_URL, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      data.sort((a, b) => b.id - a.id);
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {error && (
        <div style={{
          padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #f87171', marginBottom: '1.5rem'
        }}>
          <AlertCircle size={20}/>
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>All Payments</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Complete audit trail of all wholesaler transaction payments</p>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <CreditCard size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>No payments found</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Payments made by wholesalers will appear here in real-time.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Payment ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Wholesaler</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Shop Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>#{payment.id}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{payment.user?.name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{payment.user?.wholesalerProfile?.shopName || 'N/A'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#3b82f6', fontWeight: 600 }}>#{payment.order?.id}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#10b981' }}>₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{payment.paymentMethod}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ 
                        background: '#dcfce7', color: '#15803d', 
                        padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                      }}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
