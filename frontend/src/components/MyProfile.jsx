import { useState, useEffect } from 'react';
import { 
  User, Building2, MapPin, Mail, Phone, ShieldCheck, FileText, 
  AlertCircle, CheckCircle2, KeyRound, Lock, Eye, EyeOff, Calendar, Save, RefreshCw
} from 'lucide-react';

const PROFILE_API = 'http://localhost:8080/api/wholesaler/profile';
const CHANGE_PASSWORD_API = 'http://localhost:8080/api/wholesaler/change-password';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shopName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: ''
  });

  // Password Change Form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const [notification, setNotification] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(PROFILE_API, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        shopName: data.shopName || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        gstNumber: data.gstNumber || ''
      });
    } catch (err) {
      showNotification('error', err.message || 'Error fetching profile details');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to update profile');
      }

      setProfile(data);
      setEditing(false);
      showNotification('success', 'Profile updated successfully!');

      // Update local storage name & shopName
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      storedUser.name = data.name;
      storedUser.shopName = data.shopName;
      localStorage.setItem('user', JSON.stringify(storedUser));
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passData.currentPassword || !passData.newPassword || !passData.confirmNewPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }
    if (passData.newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (passData.newPassword !== passData.confirmNewPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch(CHANGE_PASSWORD_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(passData)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to change password');
      }

      setPassSuccess('Password changed successfully! Keep your new password safe.');
      setPassData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      showNotification('success', 'Password updated successfully!');
    } catch (err) {
      setPassError(err.message || 'Error updating password');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading profile...</div>;
  }

  if (!profile) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Profile not found. Please log in again.</div>;
  }

  return (
    <div className="fade-in">
      {/* Notifications */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: notification.type === 'error' ? '#ef4444' : '#10b981',
          border: `1px solid ${notification.type === 'error' ? '#f87171' : '#6ee7b7'}`,
          boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)'
        }}>
          {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Profile & Settings</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Manage your wholesale business details and account security credentials
          </p>
        </div>

        {!editing ? (
          <button 
            className="btn-primary" 
            onClick={() => setEditing(true)} 
            style={{ width: 'auto', padding: '0.5rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <User size={18} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button 
            className="btn-primary" 
            onClick={() => setEditing(false)} 
            style={{ width: 'auto', padding: '0.5rem 1.5rem', backgroundColor: '#64748b' }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Personal & Business Info Form/View */}
        <div style={{ gridColumn: editing ? '1 / -1' : 'auto' }} className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Building2 size={20} color="#3b82f6" />
              <span>{editing ? 'Edit Business Profile' : 'Business & Personal Details'}</span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}
            </div>
          </div>

          {!editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="responsive-form-grid">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginTop: '0.2rem' }}>{profile.name}</div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Shop Name</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginTop: '0.2rem' }}>{profile.shopName || 'N/A'}</div>
                </div>
              </div>

              <div className="responsive-form-grid">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Username</span>
                  <div style={{ fontWeight: 500, color: '#0f172a', marginTop: '0.2rem' }}>@{profile.username}</div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Mobile Number</span>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Phone size={15} color="#64748b" />
                    <span>{profile.mobile}</span>
                    <ShieldCheck size={16} color="#10b981" title="Verified Mobile" />
                  </div>
                </div>
              </div>

              <div className="responsive-form-grid">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Mail size={15} color="#64748b" />
                    <span>{profile.email || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>GST Number</span>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <FileText size={15} color="#64748b" />
                    <span>{profile.gstNumber || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Business Address</span>
                <div style={{ fontWeight: 500, color: '#0f172a', marginTop: '0.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <MapPin size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    {profile.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''} - ${profile.pincode || ''}` : 'No address provided.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Shop / Business Name *</label>
                  <input required name="shopName" value={formData.shopName} onChange={handleInputChange} type="text" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Username (Permanent)</label>
                  <input disabled value={`@${profile.username}`} className="form-input" style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number (Verified)</label>
                  <input disabled value={profile.mobile} className="form-input" style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                    Mobile number change requires security OTP verification.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="example@domain.com" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} type="text" placeholder="e.g. 27AAAAA0000A1Z5" className="form-input" />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Complete Business Address *</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="Building, Street, Area" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} type="text" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input required name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" maxLength={6} placeholder="6-digit pincode" className="form-input" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" disabled={saving} style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 2rem' }}>
                  <Save size={18} />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-primary" style={{ width: 'auto', background: '#64748b' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        {!editing && (
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} color="#f59e0b" />
                <span>Account Security & Password</span>
              </h2>
            </div>

            {passError && (
              <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {passError}
              </div>
            )}

            {passSuccess && (
              <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {passSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              {/* Current Password */}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter current password"
                    value={passData.currentPassword}
                    onChange={e => setPassData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password (Min 8 chars)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter new password"
                    value={passData.newPassword}
                    onChange={e => setPassData(prev => ({ ...prev, newPassword: e.target.value }))}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                    style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#94a3b8' }} />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={passData.confirmNewPassword}
                    onChange={e => setPassData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={changingPass}
                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <KeyRound size={18} />
                <span>{changingPass ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
