import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, User, Settings, LogOut, ChevronDown, MapPin } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const { user, logout } = useAuth();
  const { region, setRegion } = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();

  // Mapping paths to titles for header
  const getTitle = () => {
    switch (location.pathname) {
      case '/': return '';
      case '/authority': return 'Authority Check';
      case '/eligibility': return 'Eligibility';
      case '/decoder': return 'Contract Decoder';
      case '/about': return 'About';
      case '/support': return 'Support Us';
      case '/login': return 'Login';
      case '/signup': return 'Create Account';
      case '/profile': return 'My Profile';
      default: return 'Know Your Power';
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const states = [
    "India (General)",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Uttar Pradesh",
    "West Bengal"
  ];

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <Menu size={24} />
          </button>
          <div className="header-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getTitle()}</div>
        </div>

        {/* Right Section: Location + Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Location Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '20px',
                padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              <MapPin size={14} />
              <span className="mobile-hide" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {region === 'India (General)' ? 'India' : region}
              </span>
            </button>

            {isRegionOpen && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={() => setIsRegionOpen(false)} />
                <div style={{
                  position: 'absolute', top: '120%', right: 0,
                  background: '#1E1E1E', border: '1px solid #333', borderRadius: '8px',
                  width: '180px', maxHeight: '300px', overflowY: 'auto',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 50
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666', borderBottom: '1px solid #333' }}>
                    SELECT JURISDICTION
                  </div>
                  {states.map(s => (
                    <div
                      key={s}
                      onClick={() => { setRegion(s); setIsRegionOpen(false); }}
                      style={{
                        padding: '0.75rem', cursor: 'pointer', fontSize: '0.9rem',
                        color: region === s ? 'var(--primary)' : 'var(--text)',
                        background: region === s ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Profile Section */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={() => setIsProfileOpen(false)} />
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                      background: '#1E1E1E', border: '1px solid #333', borderRadius: '8px',
                      width: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 50,
                      display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                        <p style={{ fontWeight: 600, color: 'white' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#888', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ccc', textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#333'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                        <User size={16} /> Profile
                      </Link>
                      <button onClick={handleLogout} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#333'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link to="/login" style={{
                background: 'var(--primary)', color: 'black', padding: '0.4rem 1rem',
                borderRadius: '6px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem'
              }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
};


export default Layout;
