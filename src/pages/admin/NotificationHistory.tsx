import React from 'react';
import { useMockData } from '../../context/ApiDataContext';

const NotificationHistory = () => {
  const { notifications, users } = useMockData();

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '1.8rem' }}>Notification History</h1>
      <div className="glass-panel grid-scroll-x" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <h2>No Notifications Yet</h2>
            <p>Notifications will appear here when you assign shifts.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Time</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Channel</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(n => {
                const user = users.find(u => u.id === n.userId);
                return (
                  <tr key={n.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(n.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{user?.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                        background: n.type === 'Cancel' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: n.type === 'Cancel' ? 'var(--danger)' : 'var(--primary-color)'
                      }}>{n.type}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>{n.channel}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                        background: n.status === 'Success' ? '#d1fae5' : n.status === 'Failed' ? '#fee2e2' : '#fef3c7',
                        color: n.status === 'Success' ? '#059669' : n.status === 'Failed' ? '#dc2626' : '#d97706'
                      }}>
                        {n.status === 'Pending' ? 'Processing...' : n.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => alert(n.payload)}>View Payload</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default NotificationHistory;
