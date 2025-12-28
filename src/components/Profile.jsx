import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Clock, FileText, Trash2, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const { history, clearHistory } = usePreferences();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleOpenHistory = (item) => {
        if (item.type === 'authority') {
            navigate('/authority', { state: { questionId: item.id } });
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <p>Please log in to view your profile.</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: 'auto' }}>Login</button>
                    <button className="btn btn-ghost" onClick={() => navigate('/signup')} style={{ width: 'auto' }}>Signup</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>My Profile</h1>

            <div className="card" style={{ cursor: 'default', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)',
                    color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 700
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem' }}>{user.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Member since {user.joined}</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>Recent Checks</h3>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Trash2 size={14} /> Clear
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', cursor: 'default' }}>
                    <Clock size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No recent history found.</p>
                    <button className="btn btn-ghost" onClick={() => navigate('/authority')} style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        Start a Check
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.map((item, index) => (
                        <div key={index} className="card" onClick={() => handleOpenHistory(item)} style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '0.25rem' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '0.75rem', fontWeight: 700,
                                    color: item.result === 'YES' ? 'var(--danger)' : 'var(--primary)',
                                    background: item.result === 'YES' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    padding: '2px 8px', borderRadius: '4px', marginLeft: '1rem', whiteSpace: 'nowrap'
                                }}>
                                    {item.result === 'YES' ? 'THEY CAN' : 'NO'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="btn btn-ghost" onClick={handleLogout} style={{ marginTop: '2rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                Logout
            </button>
        </div>
    );
};

export default Profile;
