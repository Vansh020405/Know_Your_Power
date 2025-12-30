import React from 'react';
import { Shield, Lock, EyeOff, UserMinus, CheckCircle } from 'lucide-react';

const Privacy = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="header" style={{ marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Privacy & Data Use</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    Transparent, simple, and jargon-free.
                </p>
            </div>

            {/* What data is stored */}
            <div className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                        <Lock size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>What data is stored?</h2>
                </div>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <li><strong>Account Basics:</strong> Your name and email (only if you create an account).</li>
                    <li><strong>Saved Situations:</strong> Only specific legal scenarios you explicitly choose to "Save" to your profile.</li>
                    <li><strong>Preferences:</strong> Your selected state/language to provide relevant local info.</li>
                </ul>
            </div>

            {/* What data is NOT stored */}
            <div className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#EF4444' }}>
                        <EyeOff size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>What data is NOT stored?</h2>
                </div>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <li><strong>Conversations:</strong> We do not keep a permanent log of your individual chat messages.</li>
                    <li><strong>Personal IDs:</strong> No Aadhaar, PAN, or financial details are ever requested or stored.</li>
                    <li><strong>External Tracking:</strong> We don't track your activity outside of this application.</li>
                </ul>
            </div>

            {/* Who can access data */}
            <div className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#3B82F6' }}>
                        <Shield size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Who can access the data?</h2>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        <strong>Only you.</strong> Your data is yours. We do not sell your personal information or metadata to third parties for advertising or any other purpose.
                    </p>
                    <p>
                        Our team only accesses system-level data to fix bugs or improve the app's accuracy, never to look at individual user "Saved Situations".
                    </p>
                </div>
            </div>

            {/* How to delete */}
            <div className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                        <UserMinus size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>How can I delete my data?</h2>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        You are in full control. You can clear your locally saved history from the <strong>Settings</strong> page at any time.
                    </p>
                    <p>
                        To delete your entire account and all associated "Saved Situations" from our database, please contact us or use the "Delete Account" option in your Profile (coming soon).
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.8 }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '30px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--primary)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}>
                    <CheckCircle size={18} />
                    Your data is safe here.
                </div>
            </div>
        </div>
    );
};

export default Privacy;
