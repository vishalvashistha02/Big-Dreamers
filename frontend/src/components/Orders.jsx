import { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/orders';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
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
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      showNotification('success', `Order #${orderId} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      showNotification('error', err.message);
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
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: notification.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${notification.type === 'error' ? '#f87171' : '#6ee7b7'}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Orders Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Review and manage wholesale customer order statuses</p>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <ShoppingCart size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>No orders found</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Orders placed by wholesalers will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Wholesaler</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Shop Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const colors = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>#{order.id}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{order.user?.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{order.user?.wholesalerProfile?.shopName || 'N/A'}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ 
                          background: colors.bg, color: colors.text, 
                          padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 500 }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
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
