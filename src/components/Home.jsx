
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, FileText, ChevronRight, Zap, Search, Sparkles, Lock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
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

            {/* SECTION 1: COMPACT HERO */}
            <section style={{
                background: 'linear-gradient(180deg, #1E1E1E 0%, #111 100%)', borderRadius: '16px', padding: '1.5rem',
                textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #333'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '50%', marginBottom: '0.25rem' }}>
                        <Shield size={36} color="var(--primary)" />
                    </div>
                    <h1 className="text-gradient-animated" style={{ fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                        Know Your Power
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '90%', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                        Clear answers in real-life situations.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('quick-actions').scrollIntoView({ behavior: 'smooth' })}
                        style={{ marginTop: '1.5rem', padding: '0.75rem 2.5rem', fontSize: '1rem', width: 'auto', borderRadius: '12px' }}
                    >
                        Start
                    </button>
                </div>
            </section>

            {/* NEW: VISUAL LAW SNIPPETS (FLOATING) */}
            <section style={{ display: 'grid', gap: '0.75rem', marginTop: '-1rem' }}>
                <div className="card" style={{
                    flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '1rem',
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)',
                    borderLeft: '4px solid #3b82f6', borderRadius: '8px', cursor: 'default'
                }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '6px', borderRadius: '50%' }}>
                        <Lock size={16} color="#60a5fa" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '2px' }}>Did you know?</div>
                        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>Police cannot search your phone without consent or a warrant.</div>
                    </div>
                </div>

                <div className="card" style={{
                    flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '1rem',
                    background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.02) 100%)',
                    borderLeft: '4px solid #eab308', borderRadius: '8px', cursor: 'default'
                }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '6px', borderRadius: '50%' }}>
                        <Zap size={16} color="#facc15" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#facc15', textTransform: 'uppercase', marginBottom: '2px' }}>Important</div>
                        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>Unpaid overtime is usually not mandatory unless in contract.</div>
                    </div>
                </div>
            </section>

            {/* ACTION STRIP */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '100px', padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)', margin: '0 1rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>Tip: </span> Answers are rule-based, not opinions.
            </div>

            {/* SECTION 2: AI HELPER */}
            <section>
                <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    {/* Subtle colorful decoration blob */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 80, height: 80, background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.15 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>AI HELPER</span>
                    </div>

                    <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
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
                                                    borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                    color: msg.sender === 'user' ? '#000' : 'var(--text)',
                                                    fontSize: '0.95rem',
                                                    lineHeight: '1.4',
                                                    fontWeight: msg.sender === 'user' ? 600 : 400,
                                                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    {msg.text}
                                                </div>
                                            )}

                                            {/* Rich Content (Only for AI) */}
                                            {msg.sender === 'ai' && msg.data && msg.type === 'match' && (
                                                <div className="card" style={{
                                                    marginTop: '0.25rem', border: '1px solid rgba(255,255,255,0.1)',
                                                    background: 'rgba(0,0,0,0.2)', padding: '1rem', width: '100%'
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
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                                        {msg.data.rule.simple_explanation}
                                                    </p>

                                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', fontStyle: 'italic', fontSize: '0.8rem', color: '#ccc', marginBottom: '0.75rem' }}>
                                                        Say: "{msg.data.rule.what_to_say}"
                                                    </div>

                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => navigateToRule(msg.data.rule)}
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem', height: 'auto', background: 'rgba(255,255,255,0.05)' }}
                                                    >
                                                        Read Full Rule (Exceptions & Details) <ChevronRight size={14} />
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
                                                                padding: '0.6rem', fontSize: '0.85rem', flexDirection: 'row',
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
                                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Type your situation..."
                                    value={quickSearch}
                                    onChange={(e) => setQuickSearch(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
                                    style={{ paddingLeft: '3rem', fontSize: '1rem', height: '3.5rem' }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={(e) => handleSearch(e)}
                            style={{ width: 'auto', padding: '0 1.25rem', borderRadius: '12px', height: '3.5rem' }}
                        >
                            <ArrowRight size={22} />
                        </button>
                    </div>

                    {chatHistory.length === 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.75rem', fontStyle: 'italic', textAlign: 'center' }}>
                            Try asking: "My boss is not paying me" or "Police stopped me"
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: PRIMARY ACTION CARDS */}
            <section id="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Core Features</h2>

                <div className="card" onClick={() => navigate('/authority')} style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                    <div className="card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', flexShrink: 0, width: 48, height: 48 }}>
                        <Shield size={24} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>Can They Force Me?</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Check authority limits instantly</div>
                    </div>
                    <ChevronRight size={22} color="#555" />
                </div>

                <div className="card" onClick={() => navigate('/eligibility')} style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
                    <div className="card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', flexShrink: 0, width: 48, height: 48 }}>
                        <CheckCircle size={24} color="#3b82f6" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>Am I Eligible?</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Find scholarships & welfare schemes</div>
                    </div>
                    <ChevronRight size={22} color="#555" />
                </div>

                <div className="card" onClick={() => navigate('/decoder')} style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #a855f7' }}>
                    <div className="card-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', flexShrink: 0, width: 48, height: 48 }}>
                        <FileText size={24} color="#a855f7" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>Check My Document</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Scan contracts for risky clauses</div>
                    </div>
                    <ChevronRight size={22} color="#555" />
                </div>
            </section>

            {/* INFO STRIP */}
            <div style={{ background: 'linear-gradient(90deg, #111 0%, #222 50%, #111 100%)', borderRadius: '8px', padding: '1rem', textAlign: 'center', border: '1px solid #333' }}>
                <span style={{ color: '#a855f7', fontWeight: 600 }}>Did you know?</span> <span style={{ color: '#ccc', fontStyle: 'italic' }}>Written contracts override verbal promises.</span>
            </div>

            {/* SECTION 4: REAL-LIFE EXAMPLES */}
            <section>
                <h2 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>Live Interactions</h2>
                <div className="chat-container">
                    <div className="chat-bubble chat-user" style={{ fontSize: '0.95rem', padding: '0.8rem 1.25rem' }}>
                        HR asking me to work unpaid overtime
                    </div>
                    <div className="chat-bubble chat-app" style={{ fontSize: '0.95rem', padding: '0.8rem 1.25rem' }}>
                        They generally cannot do that.
                    </div>
                </div>
            </section>

            {/* SECTION 5: TRUST FOOTER */}
            <section style={{ textAlign: 'center', padding: '2rem 0 1rem', opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Lock size={14} /> Login Required
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Shield size={14} /> Secure & Private
                    </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#555' }}>Informational purposes only. Not legal advice.</p>
            </section>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Home;
