import { NavLink, Outlet } from 'react-router-dom';
import { Users, MapPin, Calendar, LogOut, Menu, X, Bell, Settings, ClipboardList, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useMockData } from '../context/ApiDataContext';
import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

const AdminLayout = () => {
  const { logout, currentUser } = useMockData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode();

  return (
    <div className="layout-container">
      {/* Mobile Sidebar Overlay */}
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <div className={`glass-panel sidebar ${isSidebarOpen ? 'open' : ''} ${isDesktopCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="nav-text" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Schedule</h2>
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
            to="/admin/dashboard" 
            title="Dashboard"
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
            <ClipboardList size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/calendar" 
            title="Month Calendar"
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
            <Calendar size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Month Calendar</span>
          </NavLink>

          <NavLink 
            to="/admin/daily-roster" 
            title="Daily Roster"
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
            <Calendar size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Daily Roster</span>
          </NavLink>
          
          <NavLink 
            to="/admin/reports" 
            title="Reports"
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
            <ClipboardList size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Reports</span>
          </NavLink>
          
          <NavLink 
            to="/admin/employees" 
            title="Employees"
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
            <Users size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Employees</span>
          </NavLink>
          
          <NavLink 
            to="/admin/locations" 
            title="Locations"
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
            <MapPin size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Locations</span>
          </NavLink>
          
          <div className="nav-text" style={{ padding: '1rem 0.5rem 0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>System</div>
          
          <NavLink 
            to="/admin/notifications" 
            title="Notifications"
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
            <Bell size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Notifications</span>
          </NavLink>
          
          <NavLink 
            to="/admin/settings/notifications" 
            title="Settings"
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
            <Settings size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Settings</span>
          </NavLink>
          
          <NavLink 
            to="/admin/profile" 
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
            <Users size={20} style={{ minWidth: '20px' }} /> <span className="nav-text">Profile Settings</span>
          </NavLink>
        </nav>
        
        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }} className="user-profile-section">
              <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--indigo-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 600 }}>
                {currentUser?.name.charAt(0)}
              </div>
              <div className="nav-text">
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin</div>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', paddingRight: '1rem' }}>
          <button className="hamburger-btn hide-on-desktop" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <button className="icon-btn" onClick={toggleDarkMode} title="Toggle Dark Mode">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
