import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, KeyRound, Loader2, AlertCircle, Eye, EyeOff, Store } from 'lucide-react';

const API = 'http://localhost:8080/api/auth/wholesaler';

export default function WholesalerLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('Please enter your username and password.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/wholesaler');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: '420px' }}>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo"><Building2 size={32} /><span>Big Dreamers</span></div>
          <p className="auth-subtitle">Wholesaler Login</p>
        </div>

        <div className="auth-body">
          {error && (
            <div style={{
              padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626',
              borderRadius: '8px', border: '1px solid #fecaca',
              display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem', alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text" className="form-input"
                  placeholder="Enter your username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="username" autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: 500, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Logging in…</>
                : 'Login'
              }
            </button>
          </form>

          {/* Register link */}
          <div style={{ marginTop: '1.75rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <Store size={20} color="#64748b" style={{ marginBottom: '0.4rem' }} />
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>New Wholesaler?</p>
            <Link to="/register">
              <button type="button" className="btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.5rem', fontSize: '0.875rem',
                background: 'linear-gradient(135deg, #10b981, #059669)'
              }}>
                Register Now
              </button>
            </Link>
          </div>

          {/* Back to admin link */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none' }}>
              ← Admin Login
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
