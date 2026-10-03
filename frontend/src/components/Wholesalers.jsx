import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/admin/wholesalers';

export default function Wholesalers() {
  const [wholesalers, setWholesalers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, view
  const [selectedWholesaler, setSelectedWholesaler] = useState(null);
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [notification, setNotification] = useState(null);

  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      'Content-Type': 'application/json',
      'Authorization': user.token ? `Bearer ${user.token}` : ''
    };
  };

  useEffect(() => {
    if (view === 'list') {
      fetchWholesalers();
    }
  }, [view]);

  const fetchWholesalers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setWholesalers(data);
    } catch (err) {
      showNotification('error', 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWholesaler = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete wholesaler "${name}" (ID: #${id})? This will permanently remove their profile, orders, and ledger records.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete wholesaler');
      showNotification('success', `Wholesaler #${id} deleted successfully.`);
      fetchWholesalers();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete wholesaler');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const openView = (w) => {
    setSelectedWholesaler(w);
    setView('view');
  };

  const filteredWholesalers = wholesalers.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
                        (w.wholesalerProfile?.shopName || '').toLowerCase().includes(search.toLowerCase()) ||
                        w.mobile.includes(search);
    const matchStatus = filterStatus === 'All' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="fade-in">
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: notification.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${notification.type === 'error' ? '#f87171' : '#6ee7b7'}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, marginBottom: '0.25rem' }}>Wholesaler Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Wholesalers are automatically added when they register.</p>
        </div>
        {view !== 'list' && (
          <button className="btn-primary" onClick={() => setView('list')} style={{ width: 'auto', margin: 0, backgroundColor: '#64748b' }}>
            Back to List
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="content-card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} />
              <input 
                type="text" className="form-input" placeholder="Search by name, shop or mobile..."
                style={{ paddingLeft: '2.5rem' }} value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-input" style={{ width: '180px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading wholesalers...</div>
            ) : filteredWholesalers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No wholesalers found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.875rem' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Wholesaler</th>
                    <th style={{ padding: '1rem' }}>Contact / City</th>
                    <th style={{ padding: '1rem' }}>Financials</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWholesalers.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem' }}>#{w.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{w.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{w.wholesalerProfile?.shopName || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{w.mobile}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{w.wholesalerProfile?.city || 'N/A'}, {w.wholesalerProfile?.state || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <div>Purchases: ₹0</div>
                        <div style={{ color: '#ef4444' }}>Pending: ₹0</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: w.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                          color: w.status === 'Active' ? '#166534' : '#475569'
                        }}>
                          {w.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openView(w)} style={{ padding: '0.5rem', background: '#f1f5f9', color: '#3b82f6', borderRadius: '6px', border: 'none', cursor: 'pointer' }} title="View"><Eye size={16}/></button>
                          <button onClick={() => handleDeleteWholesaler(w.id, w.name)} style={{ padding: '0.5rem', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', border: 'none', cursor: 'pointer' }} title="Delete Wholesaler"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {view === 'view' && selectedWholesaler && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="content-card">
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', color: '#0f172a' }}>Personal Information</h3>
              <div className="responsive-form-grid">
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</span><div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWholesaler.name}</div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>Mobile</span><div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWholesaler.mobile}</div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>Email</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{selectedWholesaler.email || 'N/A'}</div></div>
              </div>
            </div>

            <div className="content-card">
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', color: '#0f172a' }}>Business Information</h3>
              <div className="responsive-form-grid">
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>Shop Name</span><div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWholesaler.wholesalerProfile?.shopName || 'N/A'}</div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>GST Number</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{selectedWholesaler.wholesalerProfile?.gstNumber || 'N/A'}</div></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>Address</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{selectedWholesaler.wholesalerProfile?.address || 'N/A'}</div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>City</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{selectedWholesaler.wholesalerProfile?.city || 'N/A'}</div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>State</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{selectedWholesaler.wholesalerProfile?.state || 'N/A'}</div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>Pincode</span><div style={{ fontWeight: 500, color: '#0f172a' }}>{selectedWholesaler.wholesalerProfile?.pincode || 'N/A'}</div></div>
              </div>
            </div>
            
            <div className="content-card">
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>Order History</h3>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                No orders yet
              </div>
            </div>

            <div className="content-card">
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>Payment History</h3>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                No payments yet
              </div>
            </div>
          </div>
          
          <div>
            <div className="content-card" style={{ position: 'sticky', top: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>Account Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Wholesaler ID:</span><span style={{ fontWeight: 600 }}>#{selectedWholesaler.id}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Registration Date:</span><span style={{ fontWeight: 600 }}>{new Date(selectedWholesaler.createdAt).toLocaleDateString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Account Status:</span>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: selectedWholesaler.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: selectedWholesaler.status === 'Active' ? '#166534' : '#475569' }}>
                    {selectedWholesaler.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="content-card" style={{ position: 'sticky', top: '15rem' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>Business Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Total Orders:</span><span style={{ fontWeight: 600 }}>0</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Total Purchase:</span><span style={{ fontWeight: 600 }}>₹0.00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Total Paid:</span><span style={{ fontWeight: 600 }}>₹0.00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Pending Amount:</span>
                  <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '1.25rem' }}>₹0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
