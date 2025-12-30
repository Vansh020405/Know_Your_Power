import React from 'react';
import { Info, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="header" style={{ marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>How This App Works</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    A calm, honest explanation of our mission and methods.
                </p>
            </div>

            {/* What this app does */}
            <div className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                        <CheckCircle size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>What this app does</h2>
                </div>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <li><strong>Helps you understand:</strong> We break down common authority situations into language you can actually use.</li>
                    <li><strong>Explains the rules:</strong> We highlight what usually applies in interactions with police, HR, or administrators.</li>
                    <li><strong>Encourages calm:</strong> Our goal is to give you the confidence to handle situations politely and firmly.</li>
                </ul>
            </div>

            {/* What this app does NOT do */}
            <div className="card" style={{ cursor: 'default', borderLeft: '4px solid #EF4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#EF4444' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>What this app does NOT do</h2>
                </div>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <li><strong>Not a Lawyer:</strong> This app does not replace professional legal advice. For serious matters, always consult a qualified lawyer.</li>
                    <li><strong>No Guarantees:</strong> Real-world outcomes can vary. We provide guidance, not a guaranteed result.</li>
                    <li><strong>No Prying:</strong> We do not ask for or store sensitive personal identifiers like Aadhaar or bank details.</li>
                </ul>
            </div>

            {/* How answers are generated */}
            <div className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#3B82F6' }}>
                        <Cpu size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>How answers are generated</h2>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        Our system is built on <strong>structured scenarios</strong>, not random guesses. We cross-reference your inputs
                        with common regulations and established legal practices.
                    </p>
                    <p>
                        The AI handles the understanding of your natural language, but the advice it provides is rooted in a fixed
                        database of rules to ensure accuracy and safety. If a situation is too complex, we will explicitly tell
                        you we don't know the answer.
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Developed with the belief that "Knowledge is Power".
            </div>
        </div>
    );
};

export default About;
