import { useState, useEffect } from 'react';
import { History } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/orders/my-orders';

export default function WholesalerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      data.sort((a, b) => b.id - a.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#d97706' };
      case 'CONFIRMED': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'PROCESSING': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'SHIPPED': return { bg: '#f3e8ff', text: '#7e22ce' };
      case 'DELIVERED': return { bg: '#dcfce7', text: '#15803d' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Orders</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Track your wholesale orders and delivery status</p>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <History size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>You have no order history yet</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Orders placed via the catalog will be listed here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Paid Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const colors = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>#{order.id}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 500 }}>₹{(order.paidAmount || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ 
                          background: colors.bg, color: colors.text, 
                          padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ 
                          background: order.paymentStatus === 'PAID' ? '#dcfce7' : order.paymentStatus === 'PARTIALLY_PAID' ? '#fef3c7' : '#fee2e2', 
                          color: order.paymentStatus === 'PAID' ? '#15803d' : order.paymentStatus === 'PARTIALLY_PAID' ? '#d97706' : '#b91c1c', 
                          padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {order.paymentStatus || 'UNPAID'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
