import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, LogOut, LayoutDashboard, ShoppingCart,
  CreditCard, History, UserCircle, BookOpen, Menu, X
} from 'lucide-react';
import WholesalerOverview from '../components/WholesalerOverview';
import WholesalerProducts from '../components/WholesalerProducts';
import MyProfile from '../components/MyProfile';
import WholesalerOrders from '../components/WholesalerOrders';
import WholesalerPayments from '../components/WholesalerPayments';
import WholesalerLedger from '../components/WholesalerLedger';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'products',  label: 'Products',    icon: ShoppingCart },
  { id: 'orders',    label: 'My Orders',   icon: History },
  { id: 'payments',  label: 'Payments',    icon: CreditCard },
  { id: 'ledger',    label: 'My Ledger',   icon: BookOpen },
  { id: 'profile',   label: 'Profile',     icon: UserCircle },
];

export default function WholesalerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (!stored || stored.role !== 'wholesaler') {
      navigate('/wholesaler-login');
      return;
    }
    setUser(stored);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/wholesaler-login');
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'W';

  return (
    <div className="dashboard-layout fade-in">
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Building2 size={24} color="#34d399" />
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
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Wholesaler Portal
              </h2>
            </div>
          </div>
          <div className="user-profile">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.shopName || 'Wholesaler Partner'}</div>
            </div>
            <div className="avatar" style={{ backgroundColor: '#10b981' }}>{initials}</div>
          </div>
        </header>

        <div className="page-content">
          {activeTab === 'dashboard' && <WholesalerOverview setActiveTab={handleNavClick} />}
          {activeTab === 'products'  && <WholesalerProducts />}
          {activeTab === 'orders'    && <WholesalerOrders />}
          {activeTab === 'payments'  && <WholesalerPayments />}
          {activeTab === 'ledger'    && <WholesalerLedger />}
          {activeTab === 'profile'   && <MyProfile />}
        </div>
      </main>
    </div>
  );
}
