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
      case '/scripts': return 'Conversation Scripts';
      case '/about': return 'About';
      case '/support': return 'Support Us';
      case '/login': return '';
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
      {/* Enhanced Header */}
      <header className="app-header" style={{
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(16, 185, 129, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: '1rem' }}>
          {/* Menu Button with Hover Effect */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Menu size={20} />
          </button>

          {/* Title with Gradient */}
          <div className="header-title" style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: getTitle() ? 'linear-gradient(135deg, #F3F4F6 0%, #9CA3AF 100%)' : 'transparent',
            WebkitBackgroundClip: getTitle() ? 'text' : 'unset',
            WebkitTextFillColor: getTitle() ? 'transparent' : 'unset',
            backgroundClip: getTitle() ? 'text' : 'unset',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}>
            {getTitle()}
          </div>
        </div>

        {/* Right Section: Location + Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* Enhanced Location Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '24px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isRegionOpen ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isRegionOpen) {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRegionOpen) {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <MapPin size={16} />
              <span className="mobile-hide" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {region === 'India (General)' ? 'India' : region}
              </span>
            </button>

            {isRegionOpen && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 40,
                    background: 'rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(2px)',
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                  onClick={() => setIsRegionOpen(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  background: 'rgba(20, 20, 20, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  width: '200px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.1)',
                  zIndex: 50,
                  animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.7rem',
                    color: '#666',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}>
                    SELECT JURISDICTION
                  </div>
                  {states.map(s => (
                    <div
                      key={s}
                      onClick={() => { setRegion(s); setIsRegionOpen(false); }}
                      style={{
                        padding: '0.875rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: region === s ? 'var(--primary)' : 'var(--text)',
                        background: region === s ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        borderLeft: region === s ? '3px solid var(--primary)' : '3px solid transparent',
                        transition: 'all 0.2s ease',
                        fontWeight: region === s ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (region !== s) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.paddingLeft = '1.25rem';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (region !== s) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.paddingLeft = '1rem';
                        }
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Enhanced Profile Section */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {/* Enhanced Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 40,
                        background: 'rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(2px)',
                        animation: 'fadeIn 0.2s ease-out',
                      }}
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.75rem)',
                      right: 0,
                      background: 'rgba(20, 20, 20, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      width: '220px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.1)',
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      <div style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(16, 185, 129, 0.05)',
                      }}>
                        <p style={{ fontWeight: 700, color: 'white', marginBottom: '0.25rem', fontSize: '1rem' }}>{user.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#888', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          padding: '0.875rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: '#ccc',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.paddingLeft = '1.5rem';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#ccc';
                          e.currentTarget.style.paddingLeft = '1.25rem';
                        }}
                      >
                        <User size={18} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{
                          padding: '0.875rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: '#EF4444',
                          background: 'none',
                          border: 'none',
                          width: '100%',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.paddingLeft = '1.5rem';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.paddingLeft = '1.25rem';
                        }}
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '24px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
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
