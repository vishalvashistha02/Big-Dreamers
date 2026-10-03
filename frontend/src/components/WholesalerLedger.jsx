import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShoppingCart, History, Calendar, TrendingUp, AlertCircle, LogIn } from 'lucide-react';

const LEDGER_API_URL = 'http://localhost:8080/api/wholesaler/ledger';

export default function WholesalerLedger() {
  const navigate = useNavigate();
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    setIsAuthError(false);

    if (!user || !user.token) {
      setError('You are not logged in. Please log in to view your ledger.');
      setIsAuthError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(LEDGER_API_URL, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthError(true);
          throw new Error(data?.message || 'Your session has expired. Please log in again to continue.');
        }
        throw new Error(data?.message || 'Failed to fetch ledger data');
      }

      setLedgerData(data);
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (!ledgerData || !ledgerData.transactions) return [];
    if (dateFilter === 'all') return ledgerData.transactions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
    
    return ledgerData.transactions.filter(t => {
      const txTime = new Date(t.date).getTime();
      if (dateFilter === 'today') return txTime >= today;
      if (dateFilter === 'week') return txTime >= weekAgo;
      if (dateFilter === 'month') return txTime >= monthAgo;
      if (dateFilter === 'custom') {
        const start = customStartDate ? new Date(customStartDate + 'T00:00:00').getTime() : 0;
        const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
        return txTime >= start && txTime <= end;
      }
      return true;
    });
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading financial ledger...</div>;
  }

  if (error) {
    return (
      <div style={{
        padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: '12px', color: '#991b1b', margin: '1rem 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={22} color="#dc2626" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Ledger Notice</h3>
        </div>
        <p style={{ margin: '0 0 1rem 0', color: '#7f1d1d', fontSize: '0.95rem' }}>{error}</p>
        {isAuthError && (
          <button
            className="btn-primary"
            onClick={() => navigate('/wholesaler-login')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.6rem 1.25rem' }}
          >
            <LogIn size={18} />
            <span>Go to Wholesaler Login</span>
          </button>
        )}
      </div>
    );
  }

  if (!ledgerData) return null;

  const filteredTransactions = getFilteredTransactions();

  let displaySummary = ledgerData.summary;
  if (dateFilter !== 'all') {
    const periodOrders = filteredTransactions.filter(t => t.type === 'ORDER');
    const periodPayments = filteredTransactions.filter(t => t.type === 'PAYMENT');
    
    const totalOrderAmt = periodOrders.reduce((sum, t) => sum + (Number(t.debit) || 0), 0);
    const totalPaidAmt = periodPayments.reduce((sum, t) => sum + (Number(t.credit) || 0), 0);
    const totalDueAmt = Math.max(0, totalOrderAmt - totalPaidAmt);

    displaySummary = {
      totalOrders: periodOrders.length,
      totalOrderAmount: totalOrderAmt.toFixed(2),
      totalPaid: totalPaidAmt.toFixed(2),
      totalDue: totalDueAmt.toFixed(2)
    };
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Financial Ledger</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            {dateFilter === 'all' ? 'All-time financial overview and transactions' : `Filtered overview (${dateFilter})`}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#64748b" />
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input 
                type="date" 
                className="form-input" 
                style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)} 
              />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{dateFilter === 'all' ? 'Total Orders' : 'Period Orders'}</h3>
            <div className="value">{displaySummary.totalOrders}</div>
          </div>
          <div className="stat-icon primary"><ShoppingCart size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{dateFilter === 'all' ? 'Total Order Amount' : 'Period Orders Total'}</h3>
            <div className="value">₹{Number(displaySummary.totalOrderAmount).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon warning"><TrendingUp size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{dateFilter === 'all' ? 'Total Paid' : 'Period Paid'}</h3>
            <div className="value" style={{ color: '#10b981' }}>₹{Number(displaySummary.totalPaid).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon success"><CreditCard size={24} /></div>
        </div>
        <div className="stat-card" style={{ 
          border: Number(displaySummary.totalDue) > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0', 
          background: Number(displaySummary.totalDue) > 0 ? '#fef2f2' : '#fff' 
        }}>
          <div className="stat-content">
            <h3 style={{ color: Number(displaySummary.totalDue) > 0 ? '#b91c1c' : '#64748b' }}>
              {dateFilter === 'all' ? 'Total Due' : 'Period Due'}
            </h3>
            <div className="value" style={{ color: Number(displaySummary.totalDue) > 0 ? '#b91c1c' : '#0f172a' }}>
              ₹{Number(displaySummary.totalDue).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="stat-icon" style={{ 
            background: Number(displaySummary.totalDue) > 0 ? '#fee2e2' : '#f1f5f9', 
            color: Number(displaySummary.totalDue) > 0 ? '#ef4444' : '#64748b' 
          }}>
            <History size={24} />
          </div>
        </div>
      </div>

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#0f172a', fontWeight: 600 }}>Transaction History</h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}
          </span>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <History size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>No transactions found</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Transactions for the selected period will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Debit (Order)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Credit (Payment)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: t.type === 'PAYMENT' ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ 
                        background: t.type === 'ORDER' ? '#fef3c7' : '#dcfce7', 
                        color: t.type === 'ORDER' ? '#d97706' : '#15803d', 
                        padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>{t.reference}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{t.description}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                      {t.debit ? `₹${Number(t.debit).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                      {t.credit ? `₹${Number(t.credit).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(t.balance).toLocaleString('en-IN')}
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
