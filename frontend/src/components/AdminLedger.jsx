import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShoppingCart, History, Search, UserCircle, TrendingUp, Calendar, AlertCircle, LogIn } from 'lucide-react';

const ADMIN_WHOLESALERS_URL = 'http://localhost:8080/api/admin/wholesalers';
const ADMIN_LEDGER_URL = 'http://localhost:8080/api/admin/ledger';

export default function AdminLedger() {
  const navigate = useNavigate();
  const [wholesalers, setWholesalers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWholesaler, setSelectedWholesaler] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  
  const [loadingWholesalers, setLoadingWholesalers] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchWholesalers();
  }, []);

  useEffect(() => {
    if (selectedWholesaler) {
      fetchLedger(selectedWholesaler);
    } else {
      setLedgerData(null);
    }
  }, [selectedWholesaler]);

  const fetchWholesalers = async () => {
    setLoadingWholesalers(true);
    try {
      const response = await fetch(ADMIN_WHOLESALERS_URL);
      if (!response.ok) throw new Error('Failed to fetch wholesalers');
      const data = await response.json();
      setWholesalers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch wholesalers');
    } finally {
      setLoadingWholesalers(false);
    }
  };

  const fetchLedger = async (wholesalerId) => {
    setLoadingLedger(true);
    setError(null);
    setIsAuthError(false);

    if (!user || !user.token) {
      setError('Admin session not found. Please log in as Admin.');
      setIsAuthError(true);
      setLoadingLedger(false);
      return;
    }

    try {
      const response = await fetch(`${ADMIN_LEDGER_URL}/${wholesalerId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthError(true);
          throw new Error(data?.message || 'Admin session has expired. Please log in again.');
        }
        throw new Error(data?.message || 'Failed to fetch ledger data');
      }

      setLedgerData(data);
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoadingLedger(false);
    }
  };

  const filteredWholesalers = wholesalers.filter(w => {
    const q = searchQuery.toLowerCase();
    const nameMatch = w.name?.toLowerCase().includes(q);
    const shopMatch = (w.wholesalerProfile?.shopName || w.shopName || '').toLowerCase().includes(q);
    const mobileMatch = w.mobile?.includes(q);
    const usernameMatch = w.username?.toLowerCase().includes(q);
    return nameMatch || shopMatch || mobileMatch || usernameMatch;
  });

  const selectedWholesalerDetails = wholesalers.find(w => w.id.toString() === selectedWholesaler);

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

  const filteredTransactions = getFilteredTransactions();

  let displaySummary = ledgerData?.summary;
  if (ledgerData && dateFilter !== 'all') {
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
          <h1 className="page-title" style={{ margin: 0 }}>Wholesaler Ledgers</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            View and audit financial ledgers for all registered wholesalers
          </p>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: '#0f172a' }}>Select Wholesaler</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Filter by name, shop, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <select 
              className="form-input"
              value={selectedWholesaler}
              onChange={(e) => setSelectedWholesaler(e.target.value)}
              disabled={loadingWholesalers}
            >
              <option value="">-- Select Wholesaler ({filteredWholesalers.length}) --</option>
              {filteredWholesalers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.wholesalerProfile?.shopName || w.shopName || 'Shop'} ({w.mobile})
                </option>
              ))}
            </select>
          </div>
          {loadingWholesalers && <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading wholesalers...</span>}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '12px', color: '#991b1b', marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertCircle size={22} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Notice</h3>
          </div>
          <p style={{ margin: '0 0 1rem 0', color: '#7f1d1d', fontSize: '0.95rem' }}>{error}</p>
          {isAuthError && (
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.6rem 1.25rem' }}
            >
              <LogIn size={18} />
              <span>Go to Admin Login</span>
            </button>
          )}
        </div>
      )}

      {loadingLedger ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading ledger data...</div>
      ) : ledgerData ? (
        <>
          <div className="content-card" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="avatar" style={{ background: '#3b82f6', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCircle size={26} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f172a' }}>{selectedWholesalerDetails?.name}</h2>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    <strong>Shop:</strong> {selectedWholesalerDetails?.wholesalerProfile?.shopName || selectedWholesalerDetails?.shopName || 'N/A'} • <strong>Mobile:</strong> {selectedWholesalerDetails?.mobile} • <strong>Username:</strong> @{selectedWholesalerDetails?.username}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600 }}>{dateFilter === 'all' ? 'Total Orders' : 'Period Orders'}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>{displaySummary.totalOrders}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600 }}>{dateFilter === 'all' ? 'Total Order Amount' : 'Period Orders Total'}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>₹{Number(displaySummary.totalOrderAmount).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600 }}>{dateFilter === 'all' ? 'Total Paid' : 'Period Paid'}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>₹{Number(displaySummary.totalPaid).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600 }}>{dateFilter === 'all' ? 'Total Due' : 'Period Due'}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: Number(displaySummary.totalDue) > 0 ? '#ef4444' : '#0f172a' }}>
                  ₹{Number(displaySummary.totalDue).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0, color: '#0f172a', fontWeight: 600 }}>Transaction History</h2>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}
              </span>
            </div>
            
            {filteredTransactions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <History size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                <h3 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>No transactions found</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>No order or payment transactions recorded for this period.</p>
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
        </>
      ) : (
        <div className="content-card" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
          <UserCircle size={48} color="#cbd5e1" style={{ marginBottom: '1rem', margin: '0 auto' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Select a wholesaler above</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Choose any registered wholesaler from the dropdown to inspect their full financial ledger history.</p>
        </div>
      )}
    </div>
  );
}
