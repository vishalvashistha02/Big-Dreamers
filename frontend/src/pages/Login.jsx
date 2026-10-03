import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, KeyRound, Loader2, Shield, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [adminId, setAdminId]   = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminId.trim() || !password) {
      setError('Please enter both Admin ID and Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: adminId.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 size={32} />
            <span>Big Dreamers</span>
          </div>
          <p className="auth-subtitle">B2B Wholesale Management</p>
        </div>

        <div className="auth-body">
          {/* ─── Role selector cards ─── */}
          <div className="responsive-role-grid">
            {/* Admin card — active, stays on this page */}
            <div style={{
              padding: '1.25rem', borderRadius: '12px', textAlign: 'center', cursor: 'default',
              border: '2px solid #3b82f6', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔐</div>
              <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.95rem' }}>Admin Login</div>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>Admin ID + Password</div>
            </div>

            {/* Wholesaler card — links to wholesaler login page */}
            <Link to="/wholesaler-login" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '1.25rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                border: '2px solid #e2e8f0', background: '#f8fafc',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4, #dcfce7)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🏪</div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Wholesaler Login</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Username + Password →</div>
              </div>
            </Link>
          </div>

          {/* ─── Admin login form ─── */}
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Admin ID</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text" className="form-input"
                  placeholder="Enter Admin ID"
                  value={adminId} onChange={e => setAdminId(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Enter Admin password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <span className="form-error">{error}</span>}
            </div>

            <button
              type="submit" className="btn-primary" disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Authenticating…' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
