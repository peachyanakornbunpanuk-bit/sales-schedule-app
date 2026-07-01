import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useMockData } from '../context/ApiDataContext';

const NotificationBell = () => {
  const { inAppNotifications, markNotificationAsRead } = useMockData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = inAppNotifications ? inAppNotifications.filter(n => !n.isRead).length : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="icon-btn" 
        onClick={() => setIsOpen(!isOpen)} 
        title="Notifications"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2, background: 'var(--danger)', color: 'white', 
            fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute', top: '100%', right: 0, width: '320px', marginTop: '0.5rem',
          zIndex: 50, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: 0, overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
          </div>
          <div className="hide-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {inAppNotifications && inAppNotifications.length > 0 ? (
              inAppNotifications.map(notif => (
                <div key={notif.id} style={{ 
                  padding: '1rem', borderBottom: '1px solid var(--surface-border)', 
                  background: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  display: 'flex', gap: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{notif.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notif.message}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => markNotificationAsRead(notif.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
