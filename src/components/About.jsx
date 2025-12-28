import React from 'react';

const About = () => {
    return (
        <div>
            <div className="card" style={{ cursor: 'default' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Purpose</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    <strong>Know Your Power</strong> is designed to bridge the gap between complex legal jargon and common citizens.
                    We believe that knowledge of one's rights is the first step towards empowerment.
                </p>
            </div>

            <div className="card" style={{ cursor: 'default', marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Target Users</h2>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Students facing issues with colleges.</li>
                    <li>Employees dealing with unfair HR practices.</li>
                    <li>Tenants and landlords.</li>
                    <li>Anyone interacting with Police or civic authorities.</li>
                </ul>
            </div>

            <div className="card" style={{ cursor: 'default', marginTop: '1rem', borderLeft: '4px solid var(--warning)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--warning)' }}>Disclaimer</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    This app provides general informational guidance based on Indian Central Laws.
                    It is <strong>NOT</strong> a substitute for professional legal advice. Laws may vary by state and specific circumstances.
                    Always consult a qualified lawyer for serious legal matters.
                </p>
            </div>
        </div>
    );
};

export default About;
