import { useState, useEffect } from 'react';
import { 
  ShoppingCart, CreditCard, History, Clock, CheckCircle2, 
  TrendingUp, ArrowRight, Store, AlertCircle, RefreshCw,
  Truck, XCircle, User, MapPin, FileCheck
} from 'lucide-react';

const WHOLESALER_DASHBOARD_API = 'http://localhost:8080/api/wholesaler/dashboard';

export default function WholesalerOverview({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('last7Days'); // 'last7Days', 'last30Days', 'thisMonth'

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(WHOLESALER_DASHBOARD_API, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.message || 'Failed to load dashboard data');
      }
      setData(result);
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', margin: '1rem 0' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Notice</h3>
        <p style={{ margin: 0 }}>{error}</p>
        <button className="btn-primary" onClick={fetchDashboard} style={{ marginTop: '1rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { profile, summary, orderStatusCounts, purchaseTrends, recentOrders, recentPayments } = data;
  const currentTrend = purchaseTrends?.[timeRange] || [];
  const maxAmount = Math.max(...currentTrend.map(t => Number(t.amount) || 0), 100);

  const getOrderStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      case 'CONFIRMED': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'PROCESSING': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'SHIPPED': return { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' };
      case 'DELIVERED': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': return { bg: '#dcfce7', text: '#15803d' };
      case 'PARTIALLY_PAID': return { bg: '#fef3c7', text: '#d97706' };
      default: return { bg: '#fee2e2', text: '#b91c1c' };
    }
  };

  return (
    <div className="fade-in">
      {/* 2. Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff', padding: '1.75rem 2rem', borderRadius: '14px',
        marginBottom: '2rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.15)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            <Store size={14} color="#38bdf8" />
            <span>{profile?.shopName || 'Wholesale Partner'}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            Welcome, {profile?.name || 'Wholesaler'}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Account ID: #{profile?.id} • Mobile: {profile?.mobile} • @{profile?.username}
          </p>
        </div>

        <button 
          onClick={fetchDashboard} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', 
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
            color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500
          }}
        >
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 6. Outstanding Amount Banner */}
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '12px', marginBottom: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        background: Number(summary.totalDue) > 0 ? '#fef2f2' : '#f0fdf4',
        border: Number(summary.totalDue) > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {Number(summary.totalDue) > 0 ? (
            <AlertCircle size={24} color="#dc2626" />
          ) : (
            <CheckCircle2 size={24} color="#16a34a" />
          )}
          <div>
            <div style={{ fontSize: '0.85rem', color: Number(summary.totalDue) > 0 ? '#991b1b' : '#166534', fontWeight: 500 }}>
              Payment Status Overview
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: Number(summary.totalDue) > 0 ? '#991b1b' : '#166534' }}>
              {Number(summary.totalDue) > 0 ? `Total Due: ₹${Number(summary.totalDue).toLocaleString('en-IN')}` : 'No outstanding payment'}
            </div>
          </div>
        </div>

        {Number(summary.totalDue) > 0 && (
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('payments')}
            style={{ width: 'auto', background: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <CreditCard size={18} />
            <span>Make Payment</span>
          </button>
        )}
      </div>

      {/* 3. Quick Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('products')}
          style={{
            padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6' }}>
              <ShoppingCart size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Browse Products</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Place new wholesale order</div>
            </div>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </button>

        <button 
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>My Orders</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Track delivery & history</div>
            </div>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </button>

        <button 
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Make Payment</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pay against pending orders</div>
            </div>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </button>

        <button 
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
            textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '8px', background: '#f3e8ff', color: '#9333ea' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>My Ledger</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Full financial statement</div>
            </div>
          </div>
          <ArrowRight size={18} color="#94a3b8" />
        </button>
      </div>

      {/* 1. Dashboard Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="value">{summary.totalOrders}</div>
          </div>
          <div className="stat-icon primary"><ShoppingCart size={24} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Purchases</h3>
            <div className="value">₹{Number(summary.totalPurchase).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon warning"><TrendingUp size={24} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Paid</h3>
            <div className="value" style={{ color: '#10b981' }}>₹{Number(summary.totalPaid).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon success"><CreditCard size={24} /></div>
        </div>

        <div className="stat-card" style={{ 
          border: Number(summary.totalDue) > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0',
          background: Number(summary.totalDue) > 0 ? '#fef2f2' : '#fff'
        }}>
          <div className="stat-content">
            <h3 style={{ color: Number(summary.totalDue) > 0 ? '#b91c1c' : '#64748b' }}>Total Due</h3>
            <div className="value" style={{ color: Number(summary.totalDue) > 0 ? '#b91c1c' : '#0f172a' }}>
              ₹{Number(summary.totalDue).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="stat-icon" style={{ 
            background: Number(summary.totalDue) > 0 ? '#fee2e2' : '#f1f5f9',
            color: Number(summary.totalDue) > 0 ? '#ef4444' : '#64748b'
          }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* 7. Order Status Overview */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>My Order Status Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          {[
            { label: 'Pending', key: 'PENDING', icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Confirmed', key: 'CONFIRMED', icon: CheckCircle2, color: '#4f46e5', bg: '#e0e7ff' },
            { label: 'Processing', key: 'PROCESSING', icon: RefreshCw, color: '#0284c7', bg: '#e0f2fe' },
            { label: 'Shipped', key: 'SHIPPED', icon: Truck, color: '#9333ea', bg: '#f3e8ff' },
            { label: 'Delivered', key: 'DELIVERED', icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Cancelled', key: 'CANCELLED', icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
          ].map(st => (
            <div key={st.key} style={{ 
              padding: '0.85rem', borderRadius: '10px', background: st.bg, border: `1px solid ${st.color}30`,
              display: 'flex', flexDirection: 'column', gap: '0.35rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: st.color }}>{st.label}</span>
                <st.icon size={15} color={st.color} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                {orderStatusCounts?.[st.key] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Purchase Overview Chart */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Purchase Overview</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Historical order volumes placed through your account
            </p>
          </div>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px', gap: '0.25rem' }}>
            <button 
              onClick={() => setTimeRange('last7Days')}
              style={{
                border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                background: timeRange === 'last7Days' ? '#fff' : 'transparent',
                color: timeRange === 'last7Days' ? '#0f172a' : '#64748b',
                boxShadow: timeRange === 'last7Days' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setTimeRange('last30Days')}
              style={{
                border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                background: timeRange === 'last30Days' ? '#fff' : 'transparent',
                color: timeRange === 'last30Days' ? '#0f172a' : '#64748b',
                boxShadow: timeRange === 'last30Days' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setTimeRange('thisMonth')}
              style={{
                border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                background: timeRange === 'thisMonth' ? '#fff' : 'transparent',
                color: timeRange === 'thisMonth' ? '#0f172a' : '#64748b',
                boxShadow: timeRange === 'thisMonth' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              This Month
            </button>
          </div>
        </div>

        {currentTrend.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No purchase data for this period.</div>
        ) : (
          <div style={{ overflowX: 'auto', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: timeRange === 'last7Days' ? '1.5rem' : '0.5rem', height: '200px', minWidth: '550px', paddingBottom: '2.5rem', position: 'relative' }}>
              {currentTrend.map((item, idx) => {
                const heightPercent = Math.max(5, Math.round(((Number(item.amount) || 0) / maxAmount) * 100));
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                    <div 
                      title={`${item.label}: ₹${item.amount} (${item.orderCount} orders)`}
                      style={{
                        width: '100%', maxWidth: timeRange === 'last7Days' ? '45px' : '22px',
                        height: `${heightPercent}%`,
                        background: Number(item.amount) > 0 ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ 
                      position: 'absolute', bottom: '-24px', fontSize: '0.75rem', color: '#64748b', 
                      whiteSpace: 'nowrap', transform: timeRange === 'last30Days' && idx % 3 !== 0 ? 'scale(0)' : 'none' 
                    }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4 & 5. Recent Orders & Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent Orders */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Recent Orders</h2>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <span>View All Orders</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
              <ShoppingCart size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No orders yet. Browse products to place your first order.</p>
              <button className="btn-primary" onClick={() => setActiveTab('products')} style={{ width: 'auto', marginTop: '1rem' }}>
                Browse Products
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.6rem' }}>Order</th>
                    <th style={{ padding: '0.6rem' }}>Date</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Due</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => {
                    const stStyle = getOrderStatusBadge(o.orderStatus);
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 600 }}>#ORD{o.id}</td>
                        <td style={{ padding: '0.6rem', color: '#64748b' }}>{o.orderDate}</td>
                        <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.6rem', textAlign: 'right', color: Number(o.dueAmount) > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                          ₹{Number(o.dueAmount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            background: stStyle.bg, color: stStyle.text, border: `1px solid ${stStyle.border}`
                          }}>
                            {o.orderStatus}
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

        {/* Recent Payments */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Recent Payments</h2>
            <button 
              onClick={() => setActiveTab('payments')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <span>View All Payments</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
              <CreditCard size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No payments made yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.6rem' }}>Payment</th>
                    <th style={{ padding: '0.6rem' }}>Order</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '0.6rem' }}>Date</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>#PAY{p.id}</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>#ORD{p.orderId}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{p.paymentDate}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: '#dcfce7', color: '#15803d'
                        }}>
                          {p.status}
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

      {/* 9. Profile Summary */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="#3b82f6" />
              <span>Wholesaler Profile Summary</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Registered business details and contact parameters
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <span>View / Edit Profile</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{profile?.name || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Shop Name</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{profile?.shopName || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Username</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>@{profile?.username || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Mobile Number</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{profile?.mobile || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{profile?.email || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>GST Number</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{profile?.gstNumber || 'N/A'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Business Address</div>
            <div style={{ fontWeight: 500, color: '#0f172a', marginTop: '0.2rem' }}>
              {profile?.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''} - ${profile.pincode || ''}` : 'Address not specified'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
