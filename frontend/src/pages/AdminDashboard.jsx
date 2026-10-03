import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, LogOut, LayoutDashboard, Users, ShoppingCart, 
  CreditCard, FileText, BookOpen, Menu, X, Shield 
} from 'lucide-react';
import AdminOverview from '../components/AdminOverview';
import Wholesalers from '../components/Wholesalers';
import Products from '../components/Products';
import Orders from '../components/Orders';
import AdminPayments from '../components/AdminPayments';
import AdminLedger from '../components/AdminLedger';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    setAdminUser(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout fade-in">
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Building2 size={24} color="#38bdf8" />
            <span>Big Dreamers</span>
          </div>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: '#fff', padding: '0.25rem' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'wholesalers' ? 'active' : ''}`}
            onClick={() => handleNavClick('wholesalers')}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Users size={20} />
            <span>Wholesalers</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleNavClick('products')}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <ShoppingCart size={20} />
            <span>Products</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleNavClick('orders')}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <FileText size={20} />
            <span>Orders</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => handleNavClick('payments')}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <CreditCard size={20} />
            <span>Payments</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => handleNavClick('ledger')}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <BookOpen size={20} />
            <span>Ledger</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Admin Portal
            </h2>
          </div>
          
          <div className="user-profile">
            <div style={{ textAlign: 'right', display: 'none', '@media (minWidth: 480px)': { display: 'block' } }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{adminUser?.name || 'Administrator'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Master Control</div>
            </div>
            <div className="avatar" title="Administrator">
              <Shield size={18} />
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {activeTab === 'dashboard' ? (
            <AdminOverview setActiveTab={handleNavClick} />
          ) : activeTab === 'wholesalers' ? (
            <Wholesalers />
          ) : activeTab === 'products' ? (
            <Products />
          ) : activeTab === 'orders' ? (
            <Orders />
          ) : activeTab === 'payments' ? (
            <AdminPayments />
          ) : activeTab === 'ledger' ? (
            <AdminLedger />
          ) : (
            <div>Section not found</div>
          )}
        </div>
      </main>
    </div>
  );
}
