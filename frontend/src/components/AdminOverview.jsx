import { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, CreditCard, TrendingUp, AlertTriangle, 
  Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle, RefreshCw
} from 'lucide-react';

const DASHBOARD_API = 'http://localhost:8080/api/admin/dashboard';

export default function AdminOverview({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('last7Days'); // 'last7Days', 'last30Days', 'thisMonth'

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(DASHBOARD_API, {
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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading business dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', margin: '1rem 0' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Notice</h3>
        <p style={{ margin: 0 }}>{error}</p>
        <button className="btn-primary" onClick={fetchDashboardData} style={{ marginTop: '1rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, orderStatusCounts, salesTrends, recentOrders, recentPayments, topWholesalers, lowStockProducts } = data;
  const currentTrend = salesTrends?.[timeRange] || [];
  const maxSales = Math.max(...currentTrend.map(t => Number(t.sales) || 0), 100);

  const getStatusColor = (status) => {
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

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Business Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Real-time business performance, financial summaries, and operations status
          </p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
            background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.875rem', color: '#475569', fontWeight: 500
          }}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. Summary Cards (6 KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Wholesalers</h3>
            <div className="value">{summary.totalWholesalers}</div>
          </div>
          <div className="stat-icon primary"><Users size={24} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Products</h3>
            <div className="value">{summary.totalProducts}</div>
          </div>
          <div className="stat-icon info" style={{ background: '#e0f2fe', color: '#0284c7' }}><Package size={24} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="value">{summary.totalOrders}</div>
          </div>
          <div className="stat-icon warning"><ShoppingCart size={24} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Sales</h3>
            <div className="value" style={{ color: '#0f172a' }}>₹{Number(summary.totalSales).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><TrendingUp size={24} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Received</h3>
            <div className="value" style={{ color: '#10b981' }}>₹{Number(summary.totalReceived).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon success"><CreditCard size={24} /></div>
        </div>

        <div className="stat-card" style={{ 
          border: Number(summary.totalOutstanding) > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0',
          background: Number(summary.totalOutstanding) > 0 ? '#fef2f2' : '#fff'
        }}>
          <div className="stat-content">
            <h3 style={{ color: Number(summary.totalOutstanding) > 0 ? '#b91c1c' : '#64748b' }}>Total Outstanding</h3>
            <div className="value" style={{ color: Number(summary.totalOutstanding) > 0 ? '#b91c1c' : '#0f172a' }}>
              ₹{Number(summary.totalOutstanding).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="stat-icon" style={{ 
            background: Number(summary.totalOutstanding) > 0 ? '#fee2e2' : '#f1f5f9',
            color: Number(summary.totalOutstanding) > 0 ? '#ef4444' : '#64748b'
          }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* 2. Order Statistics Summary Cards */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 600 }}>Order Status Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Pending', key: 'PENDING', icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Confirmed', key: 'CONFIRMED', icon: CheckCircle2, color: '#4f46e5', bg: '#e0e7ff' },
            { label: 'Processing', key: 'PROCESSING', icon: RefreshCw, color: '#0284c7', bg: '#e0f2fe' },
            { label: 'Shipped', key: 'SHIPPED', icon: Truck, color: '#9333ea', bg: '#f3e8ff' },
            { label: 'Delivered', key: 'DELIVERED', icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Cancelled', key: 'CANCELLED', icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
          ].map(st => (
            <div key={st.key} style={{ 
              padding: '1rem', borderRadius: '10px', background: st.bg, border: `1px solid ${st.color}30`,
              display: 'flex', flexDirection: 'column', gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: st.color }}>{st.label}</span>
                <st.icon size={16} color={st.color} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                {orderStatusCounts?.[st.key] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Sales Overview Chart */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Sales Overview</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Dynamic revenue generated from completed and confirmed orders
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
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No sales data available for this range.</div>
        ) : (
          <div style={{ overflowX: 'auto', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: timeRange === 'last7Days' ? '1.5rem' : '0.5rem', height: '220px', minWidth: '550px', paddingBottom: '2.5rem', position: 'relative' }}>
              {currentTrend.map((item, idx) => {
                const heightPercent = Math.max(5, Math.round(((Number(item.sales) || 0) / maxSales) * 100));
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                    <div 
                      title={`${item.label}: ₹${item.sales} (${item.orderCount} orders)`}
                      style={{
                        width: '100%', maxWidth: timeRange === 'last7Days' ? '45px' : '22px',
                        height: `${heightPercent}%`,
                        background: Number(item.sales) > 0 ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : '#e2e8f0',
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

      {/* 4 & 5. Recent Orders & Recent Payments (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent Orders */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Recent Orders</h2>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No orders placed yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.6rem' }}>Order</th>
                    <th style={{ padding: '0.6rem' }}>Wholesaler</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => {
                    const stStyle = getStatusColor(o.status);
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 600 }}>#ORD{o.id}</td>
                        <td style={{ padding: '0.6rem' }}>
                          <div style={{ fontWeight: 500 }}>{o.wholesalerName || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.shopName || o.orderDate}</div>
                        </td>
                        <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            background: stStyle.bg, color: stStyle.text, border: `1px solid ${stStyle.border}`
                          }}>
                            {o.status}
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
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No payments recorded yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.6rem' }}>Payment</th>
                    <th style={{ padding: '0.6rem' }}>Wholesaler</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>#PAY{p.id}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <div style={{ fontWeight: 500 }}>{p.wholesalerName || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.paymentDate}</div>
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: '#f1f5f9', color: '#475569'
                        }}>
                          {p.paymentMethod}
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

      {/* 6. Top Wholesalers */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Top Wholesalers</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Ranked by total purchase volume from actual order transactions
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('wholesalers')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <span>View Wholesalers</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {topWholesalers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No wholesaler purchase records available.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Wholesaler</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Shop Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Total Orders</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Purchases</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Paid</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Outstanding Due</th>
                </tr>
              </thead>
              <tbody>
                {topWholesalers.map((w, idx) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      <span style={{ color: '#3b82f6', marginRight: '0.5rem' }}>#{idx + 1}</span>
                      {w.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{w.shopName || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{w.totalOrders}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(w.totalPurchaseAmount).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>₹{Number(w.totalPaid).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: Number(w.totalDue) > 0 ? '#ef4444' : '#0f172a' }}>
                      ₹{Number(w.totalDue).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Low Stock Products */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <span>Low Stock Alerts</span>
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Products with available inventory at or below threshold (10 units)
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('products')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <span>Manage Products</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#10b981', background: '#f0fdf4', borderRadius: '8px' }}>
            🎉 All products have sufficient stock levels above threshold!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                  <th style={{ padding: '0.75rem 1rem' }}>SKU</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Wholesale Price</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.productName}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>{p.sku}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{p.wholesalePrice}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                        background: p.stockQuantity === 0 ? '#fee2e2' : '#fef3c7',
                        color: p.stockQuantity === 0 ? '#b91c1c' : '#d97706'
                      }}>
                        {p.stockQuantity} units left
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
