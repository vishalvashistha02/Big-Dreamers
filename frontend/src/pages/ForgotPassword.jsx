import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Loader2, AlertCircle, CheckCircle2,
  Shield, KeyRound, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const API = 'http://localhost:8080/api/auth/wholesaler/forgot-password';
const RESEND_COOLDOWN = 30;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1); // 1=identifier, 2=otp+new-password, 3=success
  const [identifier, setIdentifier] = useState('');
  const [mobile, setMobile]       = useState('');
  const [sentTo, setSentTo]       = useState('');
  const [devOtp, setDevOtp]       = useState('');
  const [otp, setOtp]             = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; });
    }, 1000);
  };

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) { setError('Please enter your username or mobile number.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setSentTo(data.sentTo);
      setMobile(data.mobile);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep(2);
      startCountdown();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Step 2: verify OTP + reset password
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    if (!newPass || newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, newPassword: newPass, confirmPassword: confirmPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setStep(3);
      clearInterval(timerRef.current);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
      startCountdown();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: '420px' }}>
        <div className="auth-header">
          <div className="auth-logo"><Building2 size={30} /><span>Big Dreamers</span></div>
          <p className="auth-subtitle">Reset Password</p>
        </div>

        <div className="auth-body">
          {error && (
            <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} /><span>{error}</span>
            </div>
          )}

          {/* Step 1: Enter identifier */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Enter your username or registered mobile number. We'll send an OTP to verify your identity.
              </p>
              <div className="form-group">
                <label className="form-label">Username or Mobile Number</label>
                <input
                  type="text" className="form-input"
                  placeholder="e.g. rahul_garments or 9876543210"
                  value={identifier} onChange={e => setIdentifier(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</> : <><Shield size={18} /> Send OTP</>}
              </button>
              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <Link to="/wholesaler-login" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>← Back to Login</Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP + New Password */}
          {step === 2 && (
            <form onSubmit={handleReset}>
              <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <Shield size={26} color="#3b82f6" style={{ marginBottom: '0.4rem' }} />
                <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', fontSize: '0.9rem' }}>OTP sent to {sentTo}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>Expires in 5 minutes</p>
              </div>

              {/* ⚠️ DEV MODE: Show OTP on screen — remove before production */}
              {devOtp && (
                <div style={{
                  background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px',
                  padding: '0.75rem 1rem', marginBottom: '1rem', textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>🔧 DEV MODE — Your OTP:</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#b45309', letterSpacing: '0.3rem' }}>{devOtp}</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text" className="form-input"
                  placeholder="_ _ _ _ _ _"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', fontWeight: 700 }}
                  maxLength={6} autoFocus autoComplete="one-time-code"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={17} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type={showPass ? 'text' : 'password'} className="form-input"
                    placeholder="Min. 8 characters"
                    value={newPass} onChange={e => setNewPass(e.target.value)}
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={17} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type="password" className="form-input"
                    placeholder="Repeat new password"
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</> : 'Reset Password'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => { setStep(1); setError(''); clearInterval(timerRef.current); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>
                  ← Change identifier
                </button>
                <button type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                  style={{
                    background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    color: countdown > 0 ? '#94a3b8' : '#3b82f6', fontWeight: 600, fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}>
                  <RefreshCw size={14} />{countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle2 size={32} color="#fff" />
              </div>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Password Reset!</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Your password has been reset successfully. Please login with your new password.
              </p>
              <button className="btn-primary" onClick={() => navigate('/wholesaler-login')}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
