import React, { useState, useEffect } from 'react';
import { useMockData } from '../../context/ApiDataContext';
import { useToast } from '../../context/ToastContext';
import { UserCircle, Mail, Key, MessageCircle, Save } from 'lucide-react';

const ProfileSettings = () => {
  const { currentUser, users, updateUserProfile } = useMockData();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [lineUserId, setLineUserId] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fullUser = users.find(u => u.id === currentUser.id);
      if (fullUser) {
        setName(fullUser.name);
        setEmail(fullUser.email);
        setPhone(fullUser.phone || '');
        setLineUserId(fullUser.lineUserId || '');
      }
    }
  }, [currentUser, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      const updates: any = { name, email, phone };
      if (password) {
        updates.password = password;
      }
      await updateUserProfile(currentUser.id, updates);
      showToast('Profile updated successfully!', 'success');
      setPassword(''); // Clear password field after save
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Profile Settings</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Avatar / Initials Display */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: 'var(--primary-color)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCircle size={18} /> Full Name
            </label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} /> Email Address
            </label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📞 Phone Number
            </label>
            <input 
              type="tel" 
              className="input-field" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0812345678"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={18} /> LINE Account Status
            </label>
            <div style={{ padding: '1rem', border: '1px solid var(--surface-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.5)' }}>
              {lineUserId ? (
                <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✅ Your LINE account is successfully linked!</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>❌ Not Linked Yet</span>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>To receive schedule notifications automatically:</p>
                  <ol style={{ fontSize: '0.9rem', margin: '0.5rem 0', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                    <li>Add the Schedule Bot as a friend on LINE</li>
                    <li>Send a message to the bot: <strong>{email}</strong> or <strong>{phone || 'your phone number'}</strong></li>
                    <li>The bot will automatically verify and link your account!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} /> Change Password
            </label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
