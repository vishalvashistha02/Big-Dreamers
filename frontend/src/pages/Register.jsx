import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, User, Phone, Store, Mail, MapPin, Hash,
  KeyRound, Shield, Loader2, AlertCircle, CheckCircle2,
  RefreshCw, Eye, EyeOff, ArrowRight
} from 'lucide-react';

const API = 'http://localhost:8080/api/auth';
const RESEND_COOLDOWN = 30;

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttarakhand','Uttar Pradesh','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Other'
];

// ─── Icon wrapper lives OUTSIDE Register so it never remounts ────────────────
function IconWrap({ icon: Icon }) {
  return (
    <Icon size={17} style={{
      position: 'absolute', top: '14px', left: '12px',
      color: '#94a3b8', pointerEvents: 'none'
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [step, setStep]   = useState(1); // 1 = form, 2 = OTP, 3 = success
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // OTP step
  const [otp, setOtp]         = useState('');
  const [sentTo, setSentTo]   = useState('');
  const [devOtp, setDevOtp]   = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  // Password visibility
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Success
  const [registeredUsername, setRegisteredUsername] = useState('');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', username: '', mobile: '', email: '',
    password: '', confirmPassword: '',
    shopName: '', address: '', city: '', state: '', pincode: '', gstNumber: ''
  });

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(timerRef.current); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  // Single stable onChange — never recreates inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ── Step 1: validate + send OTP ─────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/wholesaler/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setSentTo(data.sentTo || `+91 XXXXX ${form.mobile.slice(-5)}`);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP + create account ─────────────────────────────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/wholesaler/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setRegisteredUsername(data.username);
      setStep(3);
      clearInterval(timerRef.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/wholesaler/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared inline styles ─────────────────────────────────────────────────────
  const iconInput = { paddingLeft: '2.4rem' };
  const iconInputRight = { paddingLeft: '2.4rem', paddingRight: '2.5rem' };

  const sectionTitle = {
    fontWeight: 600, color: '#0f172a', margin: '0 0 1rem',
    fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem'
  };

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
  const fullRow = { gridColumn: '1 / -1' };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page" style={{ padding: '2rem 1rem', minHeight: '100vh' }}>
      <div
        className="auth-card fade-in"
        style={{ maxWidth: step === 1 ? '640px' : '440px', width: '100%' }}
      >
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo"><Building2 size={30} /><span>Big Dreamers</span></div>
          <p className="auth-subtitle">Wholesaler Registration</p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0 1.5rem 1rem' }}>
            {['Details', 'Verify Mobile', 'Done'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: step > i + 1 ? '#10b981' : step === i + 1 ? '#3b82f6' : '#e2e8f0',
                  color: step >= i + 1 ? '#fff' : '#94a3b8'
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.75rem', color: step === i + 1 ? '#3b82f6' : '#94a3b8', fontWeight: step === i + 1 ? 600 : 400 }}>
                  {label}
                </span>
                {i < 2 && <div style={{ width: '20px', height: '2px', background: step > i + 1 ? '#10b981' : '#e2e8f0' }} />}
              </div>
            ))}
          </div>
        )}

        <div className="auth-body">
          {/* Error banner */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626',
              borderRadius: '8px', border: '1px solid #fecaca',
              display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* ════════════════ STEP 1: Details form ════════════════ */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} autoComplete="off">

              {/* ── Personal Info ── */}
              <p style={sectionTitle}>Personal Information</p>
              <div className="responsive-form-grid">

                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={User} />
                    <input
                      type="text" name="name" required
                      className="form-input"
                      placeholder="e.g. Rahul Kumar"
                      value={form.name}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={Phone} />
                    <input
                      type="text" name="mobile" required
                      className="form-input"
                      placeholder="10-digit mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      style={iconInput}
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={Mail} />
                    <input
                      type="email" name="email"
                      className="form-input"
                      placeholder="Optional"
                      value={form.email}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={User} />
                    <input
                      type="text" name="username" required
                      className="form-input"
                      placeholder="Unique login username"
                      value={form.username}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={KeyRound} />
                    <input
                      type={showPass ? 'text' : 'password'} name="password" required
                      className="form-input"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      style={iconInputRight}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={KeyRound} />
                    <input
                      type={showConfirm ? 'text' : 'password'} name="confirmPassword" required
                      className="form-input"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      style={iconInputRight}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* ── Business Info ── */}
              <p style={{ ...sectionTitle, marginTop: '1.5rem' }}>Business Information</p>
              <div className="responsive-form-grid">

                {/* Shop Name */}
                <div className="form-group" style={fullRow}>
                  <label className="form-label">Shop / Business Name *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={Store} />
                    <input
                      type="text" name="shopName" required
                      className="form-input"
                      placeholder="e.g. Rahul Garments"
                      value={form.shopName}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="organization"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="form-group" style={fullRow}>
                  <label className="form-label">Address *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={MapPin} />
                    <input
                      type="text" name="address" required
                      className="form-input"
                      placeholder="Street address"
                      value={form.address}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={MapPin} />
                    <input
                      type="text" name="city" required
                      className="form-input"
                      placeholder="City"
                      value={form.city}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <select
                    name="state" required
                    className="form-input"
                    value={form.state}
                    onChange={handleChange}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Pincode */}
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={Hash} />
                    <input
                      type="text" name="pincode" required
                      className="form-input"
                      placeholder="6-digit pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      style={iconInput}
                      maxLength={6}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                {/* GST Number */}
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <div style={{ position: 'relative' }}>
                    <IconWrap icon={Hash} />
                    <input
                      type="text" name="gstNumber"
                      className="form-input"
                      placeholder="Optional"
                      value={form.gstNumber}
                      onChange={handleChange}
                      style={iconInput}
                      autoComplete="off"
                    />
                  </div>
                </div>

              </div>

              {/* Submit */}
              <button
                type="submit" className="btn-primary" disabled={loading}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}
              >
                {loading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</>
                  : <><Shield size={18} /> Verify Mobile &amp; Continue <ArrowRight size={16} /></>
                }
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                Already registered?{' '}
                <Link to="/wholesaler-login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                  Login here
                </Link>
              </div>
            </form>
          )}

          {/* ════════════════ STEP 2: OTP verification ════════════════ */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                border: '1px solid #bfdbfe', borderRadius: '10px',
                padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center'
              }}>
                <Shield size={30} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', fontSize: '0.95rem' }}>OTP sent to</p>
                <p style={{ margin: '0.25rem 0 0', color: '#1d4ed8', fontWeight: 700, fontSize: '1.1rem' }}>{sentTo}</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>OTP expires in 5 minutes</p>
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
                <label className="form-label">Enter 6-digit OTP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', fontWeight: 700 }}
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit" className="btn-primary" disabled={loading}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account…</>
                  : <><CheckCircle2 size={18} /> Verify &amp; Create Account</>
                }
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); clearInterval(timerRef.current); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  ← Edit details
                </button>
                <button
                  type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                  style={{
                    background: 'none', border: 'none',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    color: countdown > 0 ? '#94a3b8' : '#3b82f6',
                    fontWeight: 600, fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={14} />
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ STEP 3: Success ════════════════ */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <CheckCircle2 size={36} color="#fff" />
              </div>
              <h2 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Registration Successful!
              </h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Your wholesaler account has been created.
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0', borderRadius: '12px',
                padding: '1.25rem', marginBottom: '2rem'
              }}>
                <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.875rem' }}>Your Login Username</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                  {registeredUsername}
                </p>
                <p style={{ margin: '0.75rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Use your username and password to login.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => navigate('/wholesaler-login')}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}
              >
                Go to Login <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
