import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, LogOut, Menu, Settings, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMockData } from '../context/ApiDataContext';
import { useState } from 'react';

const SalesLayout = () => {
  const { logout, currentUser } = useMockData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="layout-container">
      {/* Mobile Sidebar Overlay */}
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <div className={`glass-panel sidebar ${isSidebarOpen ? 'open' : ''} ${isDesktopCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="nav-text" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Employee</h2>
          <button 
            className="hamburger-btn" 
            style={{ 
              padding: '0.5rem', 
              color: 'var(--text-main)',
              background: 'rgba(0,0,0,0.04)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
          >
            {isDesktopCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="hide-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingRight: '0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
          <NavLink 
            to="/sales/dashboard" 
            title="My Schedule"
            onClick={() => setIsSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', textDecoration: 'none', 
              color: isActive ? 'white' : 'var(--text-main)',
              background: isActive ? 'var(--primary-color)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s'
            })}
          >
            <ClipboardList size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">My Schedule</span>
          </NavLink>

          <NavLink 
            to="/sales/calendar" 
            title="Master Calendar"
            onClick={() => setIsSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', textDecoration: 'none', 
              color: isActive ? 'white' : 'var(--text-main)',
              background: isActive ? 'var(--primary-color)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s'
            })}
          >
            <Calendar size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Master Calendar</span>
          </NavLink>
          
          <div className="nav-text" style={{ padding: '1rem 0.5rem 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>System</div>
          
          <NavLink 
            to="/sales/profile" 
            title="Profile Settings"
            onClick={() => setIsSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', textDecoration: 'none', 
              color: isActive ? 'white' : 'var(--text-main)',
              background: isActive ? 'var(--primary-color)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s'
            })}
          >
            <Settings size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Profile Settings</span>
          </NavLink>
        </nav>
        
        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }} className="user-profile-section">
              <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                {currentUser?.name.charAt(0)}
              </div>
              <div className="nav-text">
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sales Staff</div>
              </div>
            </div>
            <button 
              title="Logout"
              onClick={logout}
              className="btn btn-outline" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', borderColor: 'var(--border2)' }}
            >
              <LogOut size={18} style={{ minWidth: '18px' }} /> <span className="nav-text">Logout</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <button className="hamburger-btn hide-on-desktop" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SalesLayout;
