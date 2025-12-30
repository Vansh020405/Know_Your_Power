import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import {
    Globe,
    MapPin,
    Trash2,
    LogOut,
    ShieldCheck,
    ChevronRight,
    Check
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { region, setRegion, language, setLanguage, clearHistory } = usePreferences();
    const [showPrivacySummary, setShowPrivacySummary] = useState(false);
    const [clearedMessage, setClearedMessage] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleClearData = () => {
        if (window.confirm('This will clear your locally saved browsing history. Saved situations in your account will remain. Continue?')) {
            clearHistory();
            setClearedMessage('Local history cleared successfully');
            setTimeout(() => setClearedMessage(''), 3000);
        }
    };

    const languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada'];
    const regions = [
        "India (General)",
        "Maharashtra",
        "Delhi",
        "Karnataka",
        "Tamil Nadu",
        "Uttar Pradesh",
        "West Bengal"
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            {/* Header handled by Layout, but we can add sub-header if needed */}

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', letterSpacing: '1px' }}>PREFERENCES</h3>

                {/* Language Selection */}
                <div className="card" style={{ marginBottom: '0.75rem', cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                            <Globe size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>Language</p>
                            <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Choose your preferred language</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                        {languages.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    border: language === lang ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                    background: language === lang ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                                    color: language === lang ? 'var(--primary)' : '#888',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Region Selection */}
                <div className="card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                            <MapPin size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>State / Jurisdiction</p>
                            <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Tailor legal info to your location</p>
                        </div>
                    </div>

                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="input"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }}
                    >
                        {regions.map(r => (
                            <option key={r} value={r} style={{ background: '#111' }}>{r}</option>
                        ))}
                    </select>
                </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', letterSpacing: '1px' }}>DATA & PRIVACY</h3>

                <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}>
                    {/* Privacy Summary Toggle */}
                    <button
                        onClick={() => setShowPrivacySummary(!showPrivacySummary)}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ShieldCheck size={20} color="#3B82F6" />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, margin: 0 }}>Privacy Summary</p>
                                <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>How we handle your data</p>
                            </div>
                        </div>
                        <ChevronRight
                            size={18}
                            style={{
                                transition: 'transform 0.3s ease',
                                transform: showPrivacySummary ? 'rotate(90deg)' : 'none'
                            }}
                        />
                    </button>

                    {showPrivacySummary && (
                        <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.03)', fontSize: '0.9rem', color: '#bbb', lineHeight: '1.5' }}>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem' }}>We only store data required for core features.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Chat history is processed securely and is strictly for your utility.</li>
                                <li style={{ marginBottom: '0.5rem' }}>We do not sell your personal information or metadata.</li>
                                <li>Account-specific data can be cleared upon request or deletion.</li>
                            </ul>
                        </div>
                    )}

                    {/* Clear Local Data */}
                    <button
                        onClick={handleClearData}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Trash2 size={20} color="#EF4444" />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, margin: 0 }}>Clear Browsing History</p>
                                <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Wipe local data from this device</p>
                            </div>
                        </div>
                        {clearedMessage && (
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} /> {clearedMessage}
                            </span>
                        )}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#EF4444',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <LogOut size={20} />
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, margin: 0 }}>Log Out</p>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(239, 68, 68, 0.6)', margin: 0 }}>Securely end your session</p>
                            </div>
                        </div>
                    </button>
                </div>
            </section>

            <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.5 }}>
                <p style={{ fontSize: '0.8rem' }}>Know Your Power v0.1.0</p>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.05)',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}>
                    <ShieldCheck size={14} />
                    I’m in control of my data
                </div>
            </div>
        </div>
    );
};

export default Settings;
