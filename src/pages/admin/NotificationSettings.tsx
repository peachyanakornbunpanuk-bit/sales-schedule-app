import React from 'react';
import { useMockData } from '../../context/ApiDataContext';
import { useToast } from '../../context/ToastContext';

const NotificationSettings = () => {
  const { notificationSettings, updateNotificationSettings } = useMockData();
  const { showToast } = useToast();

  const handleToggle = (key: keyof typeof notificationSettings) => {
    updateNotificationSettings({ [key]: !notificationSettings[key] });
    showToast('Settings saved successfully', 'success');
  };

  const handleSelect = (key: keyof typeof notificationSettings, value: string) => {
    updateNotificationSettings({ [key]: value as any });
    showToast('Settings saved successfully', 'success');
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '1.8rem' }}>Notification Settings</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Delivery Channels</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Email Notifications</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Send schedule updates to employees via their registered email.</div>
          </div>
          <button className={`btn ${notificationSettings.enableEmail ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleToggle('enableEmail')}>
            {notificationSettings.enableEmail ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>LINE Notifications</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Send instant messages via LINE Official Account (Requires linking).</div>
          </div>
          <button className={`btn ${notificationSettings.enableLine ? 'btn-primary' : 'btn-outline'}`} onClick={() => handleToggle('enableLine')} style={{ background: notificationSettings.enableLine ? '#00B900' : 'transparent', borderColor: '#00B900', color: notificationSettings.enableLine ? 'white' : '#00B900' }}>
            {notificationSettings.enableLine ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Automated Reminders</h2>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>Delivery Mode</label>
          <select className="input-field" value={notificationSettings.deliveryMode} onChange={e => handleSelect('deliveryMode', e.target.value)}>
            <option value="Immediate">Immediate (Send as soon as shift is assigned)</option>
            <option value="Scheduled">Scheduled (Batch and send once per day)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={notificationSettings.reminder1Day} onChange={() => handleToggle('reminder1Day')} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '1.05rem' }}>Send reminder 1 Day before shift</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={notificationSettings.reminder1Hour} onChange={() => handleToggle('reminder1Hour')} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '1.05rem' }}>Send reminder 1 Hour before shift</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={notificationSettings.reminder15Min} onChange={() => handleToggle('reminder15Min')} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '1.05rem' }}>Send reminder 15 Minutes before shift</span>
          </label>
        </div>
      </div>

    </div>
  );
};
export default NotificationSettings;
