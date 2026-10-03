import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, X } from 'lucide-react';

const ORDERS_API_URL = 'http://localhost:8080/api/orders/my-orders';
const PAYMENTS_API_URL = 'http://localhost:8080/api/payments';

export default function WholesalerPayments() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, paymentsRes] = await Promise.all([
        fetch(ORDERS_API_URL, { headers: { 'Authorization': `Bearer ${user?.token}` } }),
        fetch(`${PAYMENTS_API_URL}/my-payments`, { headers: { 'Authorization': `Bearer ${user?.token}` } })
      ]);
      
      if (!ordersRes.ok || !paymentsRes.ok) throw new Error('Failed to fetch data');
      
      const ordersData = await ordersRes.json();
      const paymentsData = await paymentsRes.json();
      
      ordersData.sort((a, b) => b.id - a.id);
      paymentsData.sort((a, b) => b.id - a.id);
      
      setOrders(ordersData);
      setPayments(paymentsData);
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

  const openPaymentModal = (order) => {
    const remaining = order.totalAmount - (order.paidAmount || 0);
    if (remaining <= 0) return;
    
    setSelectedOrder(order);
    setPaymentAmount(remaining.toString());
    setShowPaymentModal(true);
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const amount = parseFloat(paymentAmount);
    const remaining = selectedOrder.totalAmount - (selectedOrder.paidAmount || 0);
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('error', 'Please enter a valid amount greater than 0');
      setSubmitting(false);
      return;
    }
    
    if (amount > remaining) {
      showNotification('error', `Amount cannot exceed the remaining balance of ₹${remaining.toLocaleString('en-IN')}`);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(PAYMENTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          amount: amount
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment failed');
      
      showNotification('success', `Payment of ₹${amount.toLocaleString('en-IN')} successful!`);
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'UNPAID': return { bg: '#fee2e2', text: '#b91c1c' };
      case 'PARTIALLY_PAID': return { bg: '#fef3c7', text: '#d97706' };
      case 'PAID': return { bg: '#dcfce7', text: '#15803d' };
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
          <h1 className="page-title" style={{ margin: 0 }}>My Payments</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Manage order payments, partial clearing, and transaction history</p>
        </div>
      </div>

      <div className="content-card">
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 600 }}>Pending Payments</h2>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading pending orders...</div>
        ) : orders.filter(o => o.paymentStatus !== 'PAID').length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={44} color="#10b981" style={{ marginBottom: '0.75rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>All orders are fully paid!</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>There are no outstanding balances against your account.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Paid Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Remaining</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.paymentStatus !== 'PAID').map(order => {
                  const colors = getStatusColor(order.paymentStatus);
                  const remaining = order.totalAmount - (order.paidAmount || 0);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>#{order.id}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: 500 }}>₹{(order.paidAmount || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#ef4444', fontWeight: 700 }}>₹{remaining.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ 
                          background: colors.bg, color: colors.text, 
                          padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {order.paymentStatus || 'UNPAID'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <button 
                          className="btn-primary" 
                          onClick={() => openPaymentModal(order)}
                          style={{ padding: '0.45rem 0.9rem', margin: 0, fontSize: '0.825rem', width: 'auto' }}
                        >
                          Make Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="content-card">
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#0f172a', fontWeight: 600 }}>Payment History</h2>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading payment records...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <CreditCard size={44} color="#cbd5e1" style={{ marginBottom: '0.75rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>No payment history found</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Payments made towards your orders will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Payment ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount Paid</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>#{payment.id}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#3b82f6', fontWeight: 500 }}>#{payment.order?.id}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#10b981' }}>₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
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

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="content-card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', margin: 0, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>Make Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Order ID</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>#{selectedOrder.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Order Total</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Already Paid</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>₹{(selectedOrder.paidAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.6rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Remaining Due</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>₹{(selectedOrder.totalAmount - (selectedOrder.paidAmount || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleMakePayment}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  autoFocus
                  style={{ fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, margin: 0 }}>
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={() => setShowPaymentModal(false)}
                  style={{ flex: 1, backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', margin: 0 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
