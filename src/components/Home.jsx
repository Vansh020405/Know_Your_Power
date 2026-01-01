import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    CheckCircle,
    FileText,
    ChevronRight,
    Zap,
    Search,
    Sparkles,
    Lock,
    AlertCircle,
    ArrowRight,
    Gavel,
    Scale,
    Phone,
    MoveRight,
    MessageCircle,
    Heart,
    Bookmark,
    Settings
} from 'lucide-react';
import { analyzeSituation } from '../utils/aiLogic';
import rulesData from '../data/rules.json';
import { API_URL } from '../config/api';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quickSearch, setQuickSearch] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    const handleSaveSituation = async (rule) => {
        if (!user) {
            if (window.confirm("Login to save this situation for later?")) {
                navigate('/login');
            }
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/auth/saved-situations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    ruleId: rule.rule_id,
                    title: rule.topic || "Legal Situation",
                    verdict: rule.verdict,
                    summary: rule.summary
                })
            });

            if (res.ok) {
                const btn = document.getElementById(`save-btn-${rule.rule_id}`);
                if (btn) {
                    // Fill the bookmark icon to show it's saved
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';
                    btn.style.color = 'var(--primary)';
                }
            } else {
                const data = await res.json();
                alert(data.msg || "Could not save.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [typingMessage, setTypingMessage] = useState('Checking rules...');

    const handleSearch = (e, overrideQuery = null) => {
        const query = overrideQuery || quickSearch;

        if ((!e || e.key === 'Enter' || e.type === 'click' || overrideQuery) && query.trim()) {

            // 1. Add User Message
            const newHistory = [...chatHistory, { sender: 'user', text: query }];
            setChatHistory(newHistory);
            setQuickSearch('');
            setIsTyping(true);

            // Context-aware typing messages
            const lowerQuery = query.toLowerCase();
            if (lowerQuery.includes('police') || lowerQuery.includes('stop')) {
                setTypingMessage('Reviewing police protocols...');
            } else if (lowerQuery.includes('boss') || lowerQuery.includes('hr') || lowerQuery.includes('work')) {
                setTypingMessage('Analyzing workplace rules...');
            } else if (lowerQuery.includes('landlord') || lowerQuery.includes('rent')) {
                setTypingMessage('Checking rental regulations...');
            } else {
                setTypingMessage('Analyzing situation...');
            }

            // 2. Simulate Thinking
            setTimeout(() => {
                let effectiveQuery = query;
                const lowerQuery = query.toLowerCase().trim();

                // Find the most recent AI message with a rule
                const lastAiMsg = chatHistory.slice().reverse().find(m => m.sender === 'ai' && m.type === 'match');

                // CONTEXT ENHANCEMENT: Detect follow-up questions
                const isActionQuery = /^(what to do|what do i do|what should i do|next steps?|help|how|action|steps?)$/i.test(lowerQuery);
                const isTopicResponse = lowerQuery.split(' ').length <= 2 && lowerQuery.length < 20; // Short clarifications like "salary", "traffic"

                // If user has a recent rule and asks for action, show the same rule with context
                if (lastAiMsg && lastAiMsg.data && lastAiMsg.data.rule) {
                    const previousRule = lastAiMsg.data.rule;

                    // If asking "what to do", return the same rule (which now has next_steps)
                    if (isActionQuery) {
                        let aiResponse = {
                            sender: 'ai',
                            text: "Here's what you can do:",
                            type: 'match',
                            data: { rule: previousRule }
                        };
                        setChatHistory(prev => [...prev, aiResponse]);
                        setIsTyping(false);
                        return;
                    }

                    // If it's a topic clarification (like responding "salary" to "Is it about Salary...?")
                    if (isTopicResponse) {
                        effectiveQuery = `${previousRule.domain} ${lowerQuery}`;
                    }
                } else if (isActionQuery) {
                    // If asking "what to do" without context, ask for more info
                    const aiResponse = {
                        sender: 'ai',
                        text: "I'd love to help! Could you first describe your situation? For example: 'Boss withholding pay' or 'Police stopped me'",
                        type: 'no_result'
                    };
                    setChatHistory(prev => [...prev, aiResponse]);
                    setIsTyping(false);
                    return;
                }

                const analysis = analyzeSituation(effectiveQuery);
                let aiResponse = { sender: 'ai', text: '' };

                if (analysis.rule && analysis.confidence > 0.4) {
                    const rule = analysis.rule;
                    let opening = "Based on common rules, it seems...";
                    if (rule.verdict === 'CANNOT') opening = "It appears they generally cannot do that.";
                    else if (rule.verdict === 'CAN') opening = "In most cases, this appears permitted.";
                    else opening = "This usually depends on specific conditions.";

                    aiResponse.text = opening;
                    aiResponse.type = 'match';
                    aiResponse.data = { rule };
                } else if (analysis.suggestions && analysis.suggestions.length > 0) {
                    aiResponse.text = "I've found some potential matches. Do any of these apply?";
                    aiResponse.type = 'suggestions';
                    aiResponse.data = { suggestions: analysis.suggestions };
                } else {
                    aiResponse.text = "I'm analyzing the context. Could you clarify if this involves work, police, or local authorities?";
                    aiResponse.type = 'no_result';
                }

                setChatHistory(prev => [...prev, aiResponse]);
                setIsTyping(false);
            }, 1100); // 1.1s latency as requested
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
        <div className="home fade-in-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '0rem' }}>

            {/* HERO SECTION */}
            <section className="hero-section">
                <video
                    className="hero-video-bg"
                    autoPlay
                    loop
                    muted
                    playsInline

                >
                    <source src="/hero_background.mp4" type="video/mp4" />
                </video>
                <div className="hero-video-overlay"></div>
                <div className="hero-video-overlay"></div>
                {/* <div className="hero-glow"></div> */}
                <div className="hero-content">
                    <div className="legal-symbols-row">
                        <div className="symbol-box"><Scale size={18} /></div>
                        <div className="symbol-box"><Gavel size={18} /></div>
                        <div className="symbol-box"><Shield size={18} /></div>
                        <div className="symbol-box"><FileText size={18} /></div>
                    </div>
                    <div className="hero-badge">
                        <Scale size={16} /> <span>Always Know Your Rights</span>
                    </div>
                    <h1 className="hero-title">
                        Instant Legal Clarity for <br /> <span className="text-highlight">Real Life.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Navigate police stops, workplace issues, and rental disputes with confidence.
                        No legalese, just answers.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn hero-btn"
                            onClick={() => document.getElementById('ai-assistant').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Ask AI Assistant <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ACTION GRID */}
            <section className="features-grid">
                <div className="feature-card" onClick={() => navigate('/authority')}>
                    <div className="feature-icon icon-emerald">
                        <Gavel size={28} />
                    </div>
                    <div className="feature-info">
                        <h3>Can They Force Me?</h3>
                        <p>Check authority powers & limits instantly.</p>
                    </div>
                    <div className="feature-arrow"><MoveRight size={20} /></div>
                </div>

                <div className="feature-card" onClick={() => navigate('/eligibility')}>
                    <div className="feature-icon icon-blue">
                        <CheckCircle size={28} />
                    </div>
                    <div className="feature-info">
                        <h3>Am I Eligible?</h3>
                        <p>Gov schemes, scholarships & benefits.</p>
                    </div>
                    <div className="feature-arrow"><MoveRight size={20} /></div>
                </div>

                <div className="feature-card" onClick={() => navigate('/decoder')}>
                    <div className="feature-icon icon-purple">
                        <Shield size={28} />
                    </div>
                    <div className="feature-info">
                        <h3>Document Shield</h3>
                        <p>Scan contracts for hidden risks.</p>
                    </div>
                    <div className="feature-arrow"><MoveRight size={20} /></div>
                </div>

                <div className="feature-card" onClick={() => navigate('/contacts')}>
                    <div className="feature-icon icon-orange">
                        <Phone size={28} />
                    </div>
                    <div className="feature-info">
                        <h3>Helplines</h3>
                        <p>Emergency numbers & legal aid.</p>
                    </div>
                    <div className="feature-arrow"><MoveRight size={20} /></div>
                </div>
            </section>

            {/* AI ASSISTANT SECTION */}
            <section id="ai-assistant" className="ai-section">
                <div className="ai-container">
                    <div className="ai-header">
                        <div className="ai-avatar">
                            <Sparkles size={20} color="#fff" />
                        </div>
                        <div className="ai-title-group">
                            <h2>Legal Assistant</h2>
                            <span className="ai-status">Online & Ready</span>
                        </div>
                    </div>

                    <div className="chat-window" ref={chatContainerRef}>
                        {chatHistory.length === 0 ? (
                            <div className="empty-chat">
                                <p>Describe your situation below...</p>
                                <div className="suggestion-chips">
                                    {['Police stopped me', 'Landlord kept deposit', 'Boss withholding pay'].map(tag => (
                                        <button key={tag} onClick={() => handleSearch(null, tag)} className="chip">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="messages-list">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`message-row ${msg.sender}`}>
                                        <div className="message-bubble">
                                            {msg.text && <div className="message-text">{msg.text}</div>}

                                            {/* RICH CARDS */}
                                            {msg.sender === 'ai' && msg.data?.rule && (
                                                <div className="rich-card fade-in">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div className={`verdict-badge verdict-${msg.data.rule.verdict.toLowerCase()}`}>
                                                            {msg.data.rule.verdict === 'CANNOT' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                            {msg.data.rule.verdict}
                                                        </div>
                                                        <button
                                                            id={`save-btn-${msg.data.rule.rule_id}`}
                                                            onClick={() => handleSaveSituation(msg.data.rule)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: 'var(--text-muted)',
                                                                cursor: 'pointer',
                                                                padding: '4px'
                                                            }}
                                                            title="Save Situation"
                                                        >
                                                            <Bookmark size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="rich-summary">{msg.data.rule.summary}</p>

                                                    {/* Show first 2 next steps if available */}
                                                    {msg.data.rule.next_steps && msg.data.rule.next_steps.length > 0 && (
                                                        <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                Quick Actions:
                                                            </div>
                                                            {msg.data.rule.next_steps.slice(0, 2).map((step, idx) => (
                                                                <div key={idx} style={{
                                                                    fontSize: '0.85rem',
                                                                    color: '#ccc',
                                                                    marginBottom: '0.5rem',
                                                                    paddingLeft: '0.5rem',
                                                                    borderLeft: '2px solid var(--primary)',
                                                                    lineHeight: '1.4'
                                                                }}>
                                                                    {idx + 1}. {step}
                                                                </div>
                                                            ))}
                                                            {msg.data.rule.next_steps.length > 2 && (
                                                                <div style={{
                                                                    fontSize: '0.75rem',
                                                                    color: 'var(--text-muted)',
                                                                    marginTop: '0.5rem',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    +{msg.data.rule.next_steps.length - 2} more steps available
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <button className="rich-btn" onClick={() => navigateToRule(msg.data.rule)}>
                                                        {msg.data.rule.next_steps && msg.data.rule.next_steps.length > 2
                                                            ? `See All ${msg.data.rule.next_steps.length} Steps`
                                                            : 'See Full Context'
                                                        } <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="message-row ai">
                                        <div className="typing-container-v2">
                                            <div className="typing-skeleton-line"></div>
                                            <span className="typing-text-hint">{typingMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="input-area">
                        <div className="input-wrapper">
                            <Search size={20} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Type your situation..."
                                value={quickSearch}
                                onChange={(e) => setQuickSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                        </div>
                        <button className="send-btn" onClick={(e) => handleSearch(e)}>
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </section>

            {/* EXAMPLE CHATS SECTION */}
            <section className="examples-section">
                <div className="section-label">
                    <MessageCircle size={16} /> RECENTLY CLARIFIED
                </div>

                <div className="chat-examples-grid">
                    {/* Ex 1 */}
                    <div className="imessage-container left-slanted">
                        <div className="imessage-bubble from-me">
                            Can police check my phone without a warrant?
                        </div>
                        <div className="imessage-bubble from-them">
                            No. Your privacy is protected. They need a warrant or your explicit consent.
                        </div>
                    </div>

                    {/* Ex 2 */}
                    <div className="imessage-container right-slanted">
                        <div className="imessage-bubble from-me">
                            My landlord won't return my security deposit.
                        </div>
                        <div className="imessage-bubble from-them">
                            They must provide a valid reason for deductions within 30 days, or refund it in full.
                        </div>
                    </div>
                </div>
            </section>

            {/* VIDEO SHOWCASE SECTION */}
            <section className="video-showcase-section">
                <div className="video-container">
                    <div className="video-overlay"></div>
                    <video
                        className="showcase-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/traffic_animation.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="video-caption">
                        <div className="caption-badge">
                            <Shield size={16} /> REAL SCENARIOS
                        </div>
                        <h3>Know Your Rights in Every Situation</h3>
                        <p>From traffic stops to workplace conflicts, we've got you covered.</p>
                    </div>
                </div>
            </section>

            {/* LOGIN BENEFITS SECTION */}
            {!user && (
                <section className="login-benefits-section">
                    <div className="benefits-container">
                        <div className="benefits-glow"></div>
                        <div className="benefits-content">
                            <h2 className="section-title">Unlock Your Full Power</h2>
                            <p className="section-subtitle">Join thousands of citizens who are taking control of their legal journey. It's free, secure, and private.</p>

                            <div className="benefits-grid">
                                <div className="benefit-item">
                                    <div className="benefit-icon"><Bookmark size={20} /></div>
                                    <div className="benefit-text">
                                        <h4>Save Situations</h4>
                                        <p>Keep a personal library of your legal checks and advice.</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-icon"><Settings size={20} /></div>
                                    <div className="benefit-text">
                                        <h4>Smart Preferences</h4>
                                        <p>Set your language and state for localized legal info.</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-icon"><Lock size={20} /></div>
                                    <div className="benefit-text">
                                        <h4>Privacy First</h4>
                                        <p>We don't track your identity or sell your personal data.</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-icon"><Zap size={20} /></div>
                                    <div className="benefit-text">
                                        <h4>Cross-Device Sync</h4>
                                        <p>Access your saved situations from any phone or computer.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="benefits-cta">
                                <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                                    Create Free Account <MoveRight size={18} />
                                </button>
                                <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                                    Log In Instead
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* MINIMAL FOOTER */}
            <footer className="minimal-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Shield size={20} className="text-primary" />
                        <span>Know Your Power</span>
                    </div>
                    <div className="footer-links">
                        <button onClick={() => navigate('/about')} className="footer-link">About</button>
                        <button onClick={() => navigate('/privacy')} className="footer-link">Privacy</button>
                        <button onClick={() => navigate('/contacts')} className="footer-link">Emergency</button>
                    </div>
                    <div className="footer-copy">
                        &copy; {new Date().getFullYear()} KnowYourPower. Informational use only.
                    </div>
                </div>
            </footer>

            {/* STYLES */}
            <style>{`
                /* HERO */
                .hero-section {
                    position: relative;
                    padding: 3rem 1.5rem;
                    text-align: center;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.05);
                    overflow: hidden;
                    background: #000;
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .hero-video-bg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    min-width: 100%;
                    min-height: 100%;
                    width: auto;
                    height: auto;
                    object-fit: cover;
                    opacity: 0.4;
                    z-index: 0;
                }
                .hero-video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(10,10,10,0.95) 0%,
                        rgba(10,10,10,0.7) 10%,
                        rgba(10,10,10,0.5) 40%,
                        rgba(10,10,10,0.5) 60%,
                        rgba(10,10,10,0.7) 90%,
                        rgba(10,10,10,0.95) 100%
                    );
                    z-index: 1;
                    pointer-events: none;
                }
                .hero-glow {
                    position: absolute;
                    top: -100px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60%;
                    height: 200px;
                    background: var(--primary);
                    filter: blur(120px);
                    opacity: 0.15;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1;
                }
                .hero-content { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
                
                .legal-symbols-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .symbol-box {
                    width: 48px;
                    height: 48px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    transition: all 0.2s ease;
                }
                .symbol-box:hover {
                    background: rgba(255,255,255,0.1);
                    color: var(--primary);
                    transform: translateY(-2px);
                    border-color: var(--primary);
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    font-size: 0.8rem;
                    color: var(--primary);
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .hero-title {
                    font-size: 2.75rem;
                    font-weight: 800;
                    line-height: 1.1;
                    margin-bottom: 1rem;
                    letter-spacing: -0.02em;
                }
                .text-highlight {
                    background: linear-gradient(135deg, #fff 0%, #aaa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    max-width: 500px;
                    margin: 0 auto 2rem;
                    line-height: 1.6;
                }
                .hero-btn {
                    padding: 0.875rem 2.5rem;
                    background: #fff;
                    color: #000;
                    box-shadow: 0 10px 20px -5px rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .hero-btn:hover {
                    background: #f8f8f8;
                    box-shadow: 0 15px 30px -5px rgba(255,255,255,0.3);
                }

                /* GRID */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1rem;
                }
                .feature-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    padding: 1.5rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                }
                .feature-card:hover {
                    transform: translateY(-4px);
                    background: rgba(40,40,40,0.6);
                    border-color: rgba(255,255,255,0.15);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .feature-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .icon-emerald { background: rgba(16, 185, 129, 0.1); color: var(--primary); }
                .icon-blue { background: rgba(59, 130, 246, 0.1); color: #60A5FA; }
                .icon-purple { background: rgba(168, 85, 247, 0.1); color: #C084FC; }
                .icon-orange { background: rgba(249, 115, 22, 0.1); color: #FB923C; }
                
                .feature-info h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
                .feature-info p { font-size: 0.9rem; color: var(--text-muted); }
                
                .feature-arrow {
                    margin-left: auto;
                    color: var(--text-muted);
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s;
                }
                .feature-card:hover .feature-arrow { opacity: 1; transform: translateX(0); color: var(--text); }

                /* AI CHAT */
                .ai-section {
                    margin-top: 1rem;
                }
                .ai-container {
                    background: #141414;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    display: flex;
                    flex-direction: column;
                    height: 600px;
                }
                .ai-header {
                    padding: 1.25rem 1.5rem;
                    background: rgba(255,255,255,0.03);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .ai-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, var(--primary), #059669);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }
                .ai-title-group h2 { font-size: 1rem; margin: 0; }
                .ai-status { font-size: 0.75rem; color: var(--primary); display: flex; align-items: center; gap: 4px; }
                .ai-status::before { content: ''; width: 6px; height: 6px; background: var(--primary); border-radius: 50%; display: inline-block; }

                .chat-window {
                    flex: 1;
                    padding: 1.5rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    background: radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
                }
                .empty-chat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    gap: 1.5rem;
                }
                .suggestion-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
                .chip {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border);
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }
                .chip:hover { background: rgba(255,255,255,0.1); color: var(--text); border-color: rgba(255,255,255,0.2); }

                .message-row { display: flex; margin-bottom: 1.25rem; width: 100%; }
                .message-row.user { justify-content: flex-end; }
                .message-row.ai { justify-content: flex-start; }
                
                .message-bubble {
                    max-width: 85%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .message-text {
                    padding: 1rem 1.25rem;
                    border-radius: 18px;
                    font-size: 0.95rem;
                    line-height: 1.5;
                }
                .user .message-text {
                    background: var(--primary);
                    color: #000;
                    border-bottom-right-radius: 4px;
                    font-weight: 500;
                }
                .ai .message-text {
                    background: rgba(255,255,255,0.08);
                    color: #ECECEC;
                    border-bottom-left-radius: 4px;
                }

                .rich-card {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 1rem;
                    margin-top: 4px;
                    animation: slideUp 0.3s ease-out;
                }
                .verdict-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .verdict-cannot { color: var(--success); }
                .verdict-can { color: var(--danger); }
                .verdict-depends { color: #facc15; }
                
                .rich-summary { font-size: 0.9rem; color: #ccc; margin-bottom: 0.75rem; line-height: 1.4; }
                .rich-btn {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: var(--text);
                    font-size: 0.8rem;
                    padding: 6px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: background 0.2s;
                }
                .rich-btn:hover { background: rgba(255,255,255,0.1); }

                .input-area {
                    padding: 1rem 1.5rem;
                    background: rgba(255,255,255,0.02);
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 1rem;
                }
                .input-wrapper {
                    flex: 1;
                    position: relative;
                }
                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .input-wrapper input {
                    width: 100%;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border);
                    padding: 1rem 1rem 1rem 3rem;
                    border-radius: 14px;
                    color: var(--text);
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-wrapper input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
                }
                .send-btn {
                    width: 54px;
                    height: 54px;
                    border-radius: 14px;
                    background: var(--primary);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #000;
                    transition: transform 0.2s;
                }
                .send-btn:hover { transform: scale(1.05); }
                .send-btn:active { transform: scale(0.95); }

                .typing-indicator span {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background: var(--text-muted);
                    border-radius: 50%;
                    margin: 0 2px;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                /* EXAMPLES SECTION */
                .examples-section { margin-top: 2rem; }
                .section-label {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.8rem; font-weight: 700; letter-spacing: 1px;
                    color: var(--text-muted); margin-bottom: 1.5rem;
                    text-transform: uppercase; padding-left: 0.5rem;
                }
                .chat-examples-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                }
                .imessage-container {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    position: relative;
                }
                
                .imessage-bubble {
                    padding: 0.75rem 1rem;
                    border-radius: 18px;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    max-width: 85%;
                }
                .from-me {
                    align-self: flex-end;
                    background: #007AFF;
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                .from-them {
                    align-self: flex-start;
                    background: #333;
                    color: #fff;
                    border-bottom-left-radius: 4px;
                }

                /* FOOTER */
                .minimal-footer {
                    margin-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding: 2rem 0;
                    opacity: 0.7;
                    transition: opacity 0.3s;
                }
                .minimal-footer:hover { opacity: 1; }
                .footer-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    text-align: center;
                }
                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: var(--text);
                }
                .text-primary { color: var(--primary); }
                .footer-links {
                    display: flex;
                    gap: 1.5rem;
                }
                .footer-link {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .footer-link:hover { color: var(--primary); }
                .footer-copy {
                    font-size: 0.8rem;
                    color: #555;
                }

                /* VIDEO SHOWCASE */
                .video-showcase-section {
                    margin-top: 3rem;
                    margin-bottom: 2rem;
                }
                .video-container {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    background: #000;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    min-height: 500px;
                }
                .showcase-video {
                    width: 100%;
                    height: 500px;
                    display: block;
                    opacity: 0.8;
                    transition: opacity 0.3s;
                    object-fit: cover;
                }
                .video-container:hover .showcase-video {
                    opacity: 0.9;
                }
                .video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom, 
                        rgba(10,10,10,1) 0%, 
                        rgba(10,10,10,0.8) 5%,
                        transparent 20%,
                        transparent 60%,
                        rgba(0,0,0,0.6) 80%,
                        rgba(0,0,0,0.95) 100%
                    );
                    pointer-events: none;
                    z-index: 1;
                }
                .video-caption {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 2rem;
                    z-index: 2;
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
                    text-align: center;
                }
                .caption-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: var(--primary);
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-bottom: 0.75rem;
                }
                .video-caption h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: #fff;
                }
                .video-caption p {
                    font-size: 0.95rem;
                    color: rgba(255,255,255,0.7);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* LOGIN BENEFITS */
                .login-benefits-section {
                    margin-top: 4rem;
                    padding: 0 1rem;
                }
                .benefits-container {
                    position: relative;
                    max-width: 1000px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 32px;
                    padding: 4rem 2rem;
                    overflow: hidden;
                    text-align: center;
                }
                .benefits-glow {
                    position: absolute;
                    top: -50%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 300px;
                    height: 300px;
                    background: var(--primary);
                    filter: blur(120px);
                    opacity: 0.1;
                    z-index: 0;
                    pointer-events: none;
                }
                .benefits-content { position: relative; z-index: 1; }
                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin: 3rem 0;
                    text-align: left;
                }
                .benefit-item {
                    display: flex;
                    gap: 1rem;
                }
                .benefit-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .benefit-text h4 { font-size: 1rem; margin-bottom: 0.25rem; }
                .benefit-text p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
                
                .benefits-cta {
                    display: flex;
                    gap: 1.25rem;
                    justify-content: center;
                    margin-top: 2rem;
                    flex-wrap: wrap;
                }
                .benefits-cta .btn {
                    padding: 0.875rem 2.25rem;
                }

                /* MOBILE RESPONSIVE */
                @media (max-width: 768px) {
                    .video-container {
                        border-radius: 16px;
                        min-height: 350px;
                    }
                    .showcase-video {
                        height: 350px;
                    }
                    .video-caption {
                        padding: 1.25rem 1rem;
                    }
                    .video-caption h3 {
                        font-size: 1.1rem;
                    }
                    .video-caption p {
                        font-size: 0.85rem;
                    }
                    .caption-badge {
                        font-size: 0.65rem;
                        padding: 4px 10px;
                    }
                    .video-showcase-section {
                        margin-top: 2rem;
                        margin-bottom: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
