import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    MoveRight
} from 'lucide-react';
import { analyzeSituation } from '../utils/aiLogic';
import rulesData from '../data/rules.json';

const Home = () => {
    const navigate = useNavigate();
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

    const handleSearch = (e, overrideQuery = null) => {
        const query = overrideQuery || quickSearch;

        if ((!e || e.key === 'Enter' || e.type === 'click' || overrideQuery) && query.trim()) {

            // 1. Add User Message
            const newHistory = [...chatHistory, { sender: 'user', text: query }];
            setChatHistory(newHistory);
            setQuickSearch('');
            setIsTyping(true);

            // 2. Simulate Thinking
            setTimeout(() => {
                let effectiveQuery = query;
                const lastAiMsg = chatHistory.slice().reverse().find(m => m.sender === 'ai' && m.type === 'match');

                if (lastAiMsg && lastAiMsg.data && lastAiMsg.data.rule) {
                    effectiveQuery = `${lastAiMsg.data.rule.domain} ${query}`;
                }

                const analysis = analyzeSituation(effectiveQuery);
                let aiResponse = { sender: 'ai', text: '' };

                if (analysis.rule && analysis.confidence > 0.4) {
                    const rule = analysis.rule;
                    let opening = "Here is the rule.";
                    if (rule.verdict === 'CANNOT') opening = "No, they generally cannot do that.";
                    else if (rule.verdict === 'CAN') opening = "Yes, in most cases they can.";
                    else opening = "It depends on the specific conditions.";

                    aiResponse.text = opening;
                    aiResponse.type = 'match';
                    aiResponse.data = { rule };
                } else if (analysis.suggestions && analysis.suggestions.length > 0) {
                    aiResponse.text = "I understood pieces of that. Do any of these rules apply?";
                    aiResponse.type = 'suggestions';
                    aiResponse.data = { suggestions: analysis.suggestions };
                } else {
                    aiResponse.text = "I see. I'm not entirely sure which rule applies. Could you clarify if this is about work, police, or housing?";
                    aiResponse.type = 'no_result';
                }

                setChatHistory(prev => [...prev, aiResponse]);
                setIsTyping(false);
            }, 800);
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
        <div className="home fade-in-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '3rem' }}>

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-glow"></div>
                <div className="hero-content">
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
                            className="btn btn-primary hero-btn"
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
                                                    <div className={`verdict-badge verdict-${msg.data.rule.verdict.toLowerCase()}`}>
                                                        {msg.data.rule.verdict === 'CANNOT' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                        {msg.data.rule.verdict}
                                                    </div>
                                                    <p className="rich-summary">{msg.data.rule.summary}</p>
                                                    <button className="rich-btn" onClick={() => navigateToRule(msg.data.rule)}>
                                                        See Full Context <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="message-row ai">
                                        <div className="typing-indicator">
                                            <span></span><span></span><span></span>
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
                    background: radial-gradient(circle at 50% 0%, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%);
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
                    opacity: 0.2;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .hero-content { position: relative; z-index: 2; }
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
                    padding: 1rem 2.5rem;
                    font-size: 1.1rem;
                    border-radius: 100px;
                    gap: 10px;
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
            `}</style>
        </div>
    );
};

export default Home;
