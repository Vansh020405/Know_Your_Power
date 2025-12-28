import React from 'react';
import { Heart } from 'lucide-react';

const Support = () => {
    return (
        <div>
            <div className="card" style={{ cursor: 'default', textAlign: 'center', alignItems: 'center' }}>
                <div style={{
                    width: 60, height: 60, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem'
                }}>
                    <Heart size={32} fill="currentColor" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Support Our Mission</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    We are a non-profit initiative dedicated to making legal knowledge accessible to everyone in India.
                </p>
            </div>

            <div className="card" style={{ cursor: 'default', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>How you can help?</h3>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Spread the word: Share this app with friends and family.</li>
                    <li>Feedback: Tell us how we can improve.</li>
                    <li>Contribute: If you are a lawyer or developer, join us.</li>
                </ul>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Built with integrity. No data tracking. No ads.
                </p>
            </div>
        </div>
    );
};

export default Support;
