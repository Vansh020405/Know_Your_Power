import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    CheckCircle,
    FileText,
    Heart,
    Info,
    X,
    Home,
    Phone,
    Bookmark,
    MessageCircle,
    Settings,
    Lock
} from 'lucide-react';

const Sidebar = ({ isOpen, close }) => {
    const { user } = useAuth();
    return (
        <>
            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={close}
            />

            {/* Drawer */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span style={{ flex: 1 }}>Know Your Power</span>
                    <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-content">
                    <div className="nav-section-label">Menu</div>

                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                        end
                    >
                        <Home size={20} className="nav-link-icon" />
                        <span style={{ fontWeight: 500 }}>Home</span>
                    </NavLink>

                    {user && (
                        <NavLink
                            to="/saved"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={close}
                        >
                            <Bookmark size={20} className="nav-link-icon" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 500 }}>Saved Situations</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>My Personal History</span>
                            </div>
                        </NavLink>
                    )}

                    <NavLink
                        to="/authority"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <Shield size={20} className="nav-link-icon" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500 }}>Can They Force Me?</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Check Authority Power</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/eligibility"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <CheckCircle size={20} className="nav-link-icon" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500 }}>Am I Eligible?</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Benefits & Schemes</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/decoder"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <FileText size={20} className="nav-link-icon" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500 }}>Check My Document</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Contract Decoder</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/contacts"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <Phone size={20} className="nav-link-icon" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500 }}>Important Contacts</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Helplines & Official Aid</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/scripts"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <MessageCircle size={20} className="nav-link-icon" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500 }}>Conversation Scripts</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>What to Say & How</span>
                        </div>
                    </NavLink>

                    <div className="nav-section-label" style={{ marginTop: '1rem' }}>Other</div>

                    <NavLink
                        to="/privacy"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <Lock size={20} className="nav-link-icon" />
                        <span>Privacy & Data</span>
                    </NavLink>

                    <NavLink
                        to="/about"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <Info size={20} className="nav-link-icon" />
                        <span>About</span>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={close}
                    >
                        <Settings size={20} className="nav-link-icon" />
                        <span>Settings</span>
                    </NavLink>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
