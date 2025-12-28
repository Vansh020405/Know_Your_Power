
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, FileText, ChevronRight, Zap, Search, Sparkles, Lock, AlertCircle, XCircle, ArrowRight, Gavel, Scale } from 'lucide-react';
import { analyzeSituation } from '../utils/aiLogic';
import rulesData from '../data/rules.json';

const Home = () => {
    const navigate = useNavigate();
    const [quickSearch, setQuickSearch] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSearch = (e, overrideQuery = null) => {
        const query = overrideQuery || quickSearch;

        // Trigger on Enter or Button Click or Direct Call
        if ((!e || e.key === 'Enter' || e.type === 'click' || overrideQuery) && query.trim()) {

            // 1. Add User Message
            const newHistory = [...chatHistory, { sender: 'user', text: query }];
            setChatHistory(newHistory);
            setQuickSearch(''); // Clear input

            // 2. Simulate Thinking (Short Delay)
            setTimeout(() => {
                // CONTEXTUAL AWARENESS
                let effectiveQuery = query;
                const lastAiMsg = chatHistory.slice().reverse().find(m => m.sender === 'ai' && m.type === 'match');

                if (lastAiMsg && lastAiMsg.data && lastAiMsg.data.rule) {
                    // Prepend domain if context exists
                    effectiveQuery = `${lastAiMsg.data.rule.domain} ${query}`;
                }

                const analysis = analyzeSituation(effectiveQuery);
                let aiResponse = { sender: 'ai', text: '' };

                if (analysis.rule && analysis.confidence > 0.4) {
                    // Match Found
                    const rule = analysis.rule;

                    // Simple intro based on verdict
                    let opening = "Here is the rule.";
                    if (rule.verdict === 'CANNOT') opening = "No, they generally cannot do that.";
                    else if (rule.verdict === 'CAN') opening = "Yes, in most cases they can.";
                    else opening = "It depends on the specific conditions.";

                    aiResponse.text = opening;
                    aiResponse.type = 'match';
                    aiResponse.data = { rule };
                } else if (analysis.suggestions && analysis.suggestions.length > 0) {
                    // Suggestions
                    aiResponse.text = "I understood pieces of that. Do any of these rules apply?";
                    aiResponse.type = 'suggestions';
                    aiResponse.data = { suggestions: analysis.suggestions };
                } else {
                    // Helpful Fallback
                    aiResponse.text = "I see. I want to give you the right information, but I'm not sure which rule applies yet. Could you clarify if this is about work, police, or housing?";
                    aiResponse.type = 'no_result';
                }

                setChatHistory(prev => [...prev, aiResponse]);
            }, 600);
        }
    };

    const navigateToRule = (rule) => {
        navigate('/authority', {
            state: {
                ruleId: rule.rule_id,
                initialSearch: quickSearch
            }
        });
    };

    return (
        <div className="home" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '2rem' }}>

            {/* SECTION 1: HERO WITH LEGAL ANIMATION */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)',
                borderRadius: '24px', padding: '2.5rem 1.5rem',
                textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Background Decoration */}
                <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

                    {/* ANIMATED LEGAL ICON */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                        padding: '1.25rem', borderRadius: '50%', marginBottom: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)'
                    }}>
                        <Scale size={42} color="var(--primary)" style={{ animation: 'balance 4s ease-in-out infinite' }} />
                    </div>

                    <h1 className="text-gradient-animated" style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: '-1px' }}>
                        Know Your Power
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                        Instant legal clarity for <span style={{ color: '#fff', fontWeight: 600 }}>real life</span>.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('quick-actions').scrollIntoView({ behavior: 'smooth' })}
                        style={{ marginTop: '1rem', padding: '1rem 3rem', fontSize: '1.1rem', width: 'auto', borderRadius: '100px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}
                    >
                        Check My Rights
                    </button>
                </div>
            </section>

            {/* NEW: VISUAL LAW SNIPPETS (FLOATING CARDS) */}
            <section style={{ display: 'grid', gap: '1rem', marginTop: '-1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div className="card" style={{
                    flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
                    borderLeft: '4px solid #3b82f6', borderRadius: '12px', cursor: 'default',
                    animation: 'fadeIn 0.6s ease-out 0.2s backwards'
                }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Lock size={20} color="#60a5fa" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '4px' }}>Privacy Rights</div>
                        <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>Police cannot search your phone without a warrant.</div>
                    </div>
                </div>

                <div className="card" style={{
                    flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                    background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.02) 100%)',
                    borderLeft: '4px solid #eab308', borderRadius: '12px', cursor: 'default',
                    animation: 'fadeIn 0.6s ease-out 0.4s backwards'
                }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Zap size={20} color="#facc15" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#facc15', textTransform: 'uppercase', marginBottom: '4px' }}>Workplace</div>
                        <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>Unpaid overtime is not mandatory without a contract.</div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: AI HELPER */}
            <section style={{ animation: 'fadeIn 0.8s ease-out' }}>
                <div style={{
                    background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem',
                    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '8px' }}>
                            <Sparkles size={20} color="var(--primary)" />
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px' }}>AI Legal Assistant</span>
                    </div>

                    <div style={{ position: 'relative', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            {chatHistory.length > 0 ? (
                                <div
                                    ref={chatContainerRef}
                                    style={{
                                        maxHeight: '350px', overflowY: 'auto', marginBottom: '1rem',
                                        display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '4px',
                                        scrollBehavior: 'smooth'
                                    }}
                                >
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} style={{
                                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '96%',
                                            display: 'flex', flexDirection: 'column', gap: '0.25rem',
                                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                        }}>
                                            {/* Chat Bubble used for text */}
                                            {msg.text && (
                                                <div style={{
                                                    padding: '0.8rem 1rem',
                                                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                                    color: msg.sender === 'user' ? '#000' : 'var(--text)',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.5',
                                                    fontWeight: msg.sender === 'user' ? 600 : 400,
                                                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    {msg.text}
                                                </div>
                                            )}

                                            {/* Rich Content (Only for AI) */}
                                            {msg.sender === 'ai' && msg.data && msg.type === 'scenario' && (
                                                <div className="card" style={{
                                                    marginTop: '0.25rem', border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'rgba(0,0,0,0.3)', padding: '1rem', width: '100%'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#facc15', textTransform: 'uppercase' }}>
                                                            🚦 Traffic Guide: {msg.data.rule.title}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                                                        "{msg.data.rule.what_this_means}"
                                                    </p>

                                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                                                            <strong style={{ color: 'var(--success)', display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>✅ You Can Say:</strong>
                                                            <ul style={{ margin: '0 0 0 1.25rem', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                                                                {msg.data.rule.what_you_can_say.map((s, i) => <li key={i}>{s}</li>)}
                                                            </ul>
                                                        </div>
                                                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                                                            <strong style={{ color: 'var(--danger)', display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>❌ Avoid Saying:</strong>
                                                            <ul style={{ margin: '0 0 0 1.25rem', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                                                                {msg.data.rule.what_not_to_say.map((s, i) => <li key={i}>{s}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        <strong>Next:</strong> {msg.data.rule.what_happens_next}
                                                    </div>
                                                </div>
                                            )}

                                            {msg.sender === 'ai' && msg.data && msg.type === 'match' && (
                                                <div className="card" style={{
                                                    marginTop: '0.25rem', border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'rgba(0,0,0,0.3)', padding: '1rem', width: '100%'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        {msg.data.rule.verdict === 'CANNOT'
                                                            ? <CheckCircle size={20} color="var(--success)" />
                                                            : (msg.data.rule.verdict === 'CAN' ? <AlertCircle size={20} color="var(--danger)" /> : <Zap size={20} color="#facc15" />)
                                                        }
                                                        <span style={{
                                                            fontWeight: 700, fontSize: '0.9rem',
                                                            color: msg.data.rule.verdict === 'CANNOT' ? 'var(--success)' : (msg.data.rule.verdict === 'CAN' ? 'var(--danger)' : '#facc15')
                                                        }}>
                                                            {msg.data.rule.verdict}
                                                        </span>
                                                    </div>

                                                    <p style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                                                        {msg.data.rule.summary}
                                                    </p>

                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => navigateToRule(msg.data.rule)}
                                                        style={{ fontSize: '0.8rem', padding: '0.5rem', height: 'auto', background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem', justifyContent: 'space-between' }}
                                                    >
                                                        Read Full Details <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {msg.sender === 'ai' && msg.data && msg.type === 'suggestions' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                                    {msg.data.suggestions.map(r => (
                                                        <button
                                                            key={r.rule_id}
                                                            onClick={() => handleSearch(null, r.summary)}
                                                            className="card"
                                                            style={{
                                                                padding: '0.8rem', fontSize: '0.85rem', flexDirection: 'row',
                                                                alignItems: 'center', justifyContent: 'space-between',
                                                                background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                                                                border: '1px solid transparent',
                                                                textAlign: 'left'
                                                            }}
                                                        >
                                                            <span>{r.summary}</span>
                                                            <ChevronRight size={14} color="#666" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Type your situation (e.g. Police stopped me)..."
                                    value={quickSearch}
                                    onChange={(e) => setQuickSearch(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
                                    style={{ paddingLeft: '3rem', fontSize: '1rem', height: '3.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)' }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={(e) => handleSearch(e)}
                            style={{ width: 'auto', padding: '0 1.25rem', borderRadius: '16px', height: '3.5rem' }}
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    {chatHistory.length === 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            {['Police stopped me', 'Landlord eviction', 'Employer not paying'].map(tag => (
                                <span
                                    key={tag}
                                    onClick={() => handleSearch(null, tag)}
                                    style={{
                                        fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)',
                                        padding: '0.4rem 0.8rem', borderRadius: '20px',
                                        color: 'var(--text-muted)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.2s'
                                    }}
                                    className="tag-hover"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: PRIMARY ACTION CARDS */}
            <section id="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Core Features</h2>

                <div className="card" onClick={() => navigate('/authority')} style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}>
                    <div className="card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', flexShrink: 0, width: 52, height: 52, borderRadius: '16px' }}>
                        <Gavel size={24} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>Can They Do That?</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Check authority limits & rules</div>
                    </div>
                    <ChevronRight size={22} color="#555" />
                </div>

                <div className="card" onClick={() => navigate('/eligibility')} style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}>
                    <div className="card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', flexShrink: 0, width: 52, height: 52, borderRadius: '16px' }}>
                        <CheckCircle size={24} color="#3b82f6" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>Am I Eligible?</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Scholarships & welfare schemes</div>
                    </div>
                    <ChevronRight size={22} color="#555" />
                </div>

                <div className="card" onClick={() => navigate('/decoder')} style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #a855f7', cursor: 'pointer' }}>
                    <div className="card-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', flexShrink: 0, width: 52, height: 52, borderRadius: '16px' }}>
                        <FileText size={24} color="#a855f7" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>Check My PDF</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Scan contracts for risky clauses</div>
                    </div>
                    <ChevronRight size={22} color="#555" />
                </div>
            </section>

            {/* INFO STRIP */}
            <div style={{ background: 'linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid #222' }}>
                <span style={{ color: '#a855f7', fontWeight: 600 }}>Did you know?</span> <span style={{ color: '#aaa', fontStyle: 'italic' }}> Written emails can serve as legal evidence.</span>
            </div>

            {/* FOOTER */}
            <section style={{ textAlign: 'center', padding: '2rem 0 1rem', opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Lock size={14} /> Login Required
                    </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#555' }}>Informational purposes only. Not legal advice.</p>
            </section>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes balance {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-8deg); }
                    75% { transform: rotate(8deg); }
                }
                .tag-hover:hover {
                    background: rgba(255,255,255,0.1) !important;
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default Home;
