import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, CheckCircle, ChevronRight, Bookmark } from 'lucide-react';
import { API_URL } from '../config/api';

const SavedSituations = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [savedItems, setSavedItems] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
            return;
        }

        const fetchSaved = async () => {
            try {
                // Since user.savedSituations might be stale if we relied on context only (unless we updated it),
                // it's safer to fetch fresh from API.
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/auth/saved-situations`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSavedItems(data);
                }
            } catch (err) {
                console.error("Failed to fetch saved situations", err);
            } finally {
                setFetchLoading(false);
            }
        };

        if (user) {
            fetchSaved();
        }
    }, [user, loading, navigate]);

    const handleDelete = async (e, ruleId) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Remove this from your saved list?")) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/auth/saved-situations/${ruleId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSavedItems(data);
                }
            } catch (err) {
                console.error("Failed to delete", err);
            }
        }
    };

    const handleOpen = (ruleId) => {
        navigate('/authority', { state: { ruleId } });
    };

    if (loading || fetchLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Bookmark size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Saved Situations</h1>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your personal legal history</span>
                </div>
            </div>

            {savedItems.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    <p style={{ marginBottom: '1rem' }}>No saved situations yet.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Start a New Check
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {savedItems.map((item) => (
                        <div
                            key={item.ruleId}
                            className="card"
                            onClick={() => handleOpen(item.ruleId)}
                            style={{
                                padding: '0.875rem 1.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                    color: item.verdict === 'CANNOT' ? 'var(--primary)' : (item.verdict === 'CAN' ? '#ef4444' : '#facc15')
                                }}>
                                    {item.verdict === 'CANNOT' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    {item.verdict}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>{item.title}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={(e) => handleDelete(e, item.ruleId)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover-bg"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <ChevronRight size={20} color="var(--text-muted)" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedSituations;
