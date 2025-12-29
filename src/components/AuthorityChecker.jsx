import React, { useState, useEffect } from 'react';
import rulesData from '../data/rules.json';
import { ChevronLeft, Scale, Shield, Briefcase, Home, GraduationCap, Building, ChevronRight, AlertCircle, CheckCircle, Zap, Sparkles, Copy, BookOpen, ChevronDown, ChevronUp, MapPin, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzeSituation } from '../utils/aiLogic';
import { usePreferences } from '../context/PreferencesContext';

const AuthorityChecker = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToHistory, region } = usePreferences();

    // UI State
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedRule, setSelectedRule] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isDetailedOpen, setIsDetailedOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // AI State
    const [aiInput, setAiInput] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState(null);

    const icons = {
        Workplace: <Briefcase size={28} />,
        Police: <Shield size={28} />,
        College: <GraduationCap size={28} />,
        Documents: <FileTextIcon size={28} /> // Custom placeholder
    };

    function FileTextIcon({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>; }

    // Derive Hierarchy from Rules
    const getDomains = () => {
        const domains = [...new Set(rulesData.rules.map(r => r.domain))];
        return domains;
    };

    const getTopics = (domain) => {
        return [...new Set(rulesData.rules.filter(r => r.domain === domain).map(r => r.topic))];
    };

    const getRules = (domain, topic) => {
        let rules = rulesData.rules.filter(r => r.domain === domain);
        if (topic) rules = rules.filter(r => r.topic === topic);
        return rules;
    };

    // Deep Link & AI Handling
    useEffect(() => {
        if (location.state?.ruleId) {
            const rId = location.state.ruleId;
            const foundRule = rulesData.rules.find(r => r.rule_id === rId);
            if (foundRule) {
                setSelectedDomain(foundRule.domain);
                setSelectedTopic(foundRule.topic);
                setSelectedRule(foundRule);
                window.history.replaceState({}, document.title);
            }
        }

        if (location.state?.initialSearch) {
            const query = location.state.initialSearch;
            setAiInput(query);
            const result = analyzeSituation(query);

            if (result && result.rule) {
                // Auto-redirect to rule if high confidence
                if (result.confidence > 0.8) {
                    setSelectedDomain(result.rule.domain);
                    setSelectedTopic(result.rule.topic);
                    setSelectedRule(result.rule);
                } else {
                    setAiSuggestion(result);
                }
            } else {
                setSearchTerm(query);
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // History Tracking
    useEffect(() => {
        if (selectedRule) {
            addToHistory({
                id: selectedRule.rule_id || selectedRule.scenario_id,
                title: selectedRule.summary || selectedRule.title,
                type: 'authority',
                result: selectedRule.verdict
            });
            setIsSourceOpen(false);
            setIsDetailedOpen(false);
            setCopied(false);
        }
    }, [selectedRule]);

    const handleCopy = () => {
        if (selectedRule?.what_to_say) {
            navigator.clipboard.writeText(selectedRule.what_to_say);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAiSearch = (e) => {
        const val = e.target.value;
        setAiInput(val);

        if (val.length > 5) {
            const result = analyzeSituation(val);
            if (result && result.rule) {
                setAiSuggestion(result);
            } else {
                setAiSuggestion(null);
            }
        } else {
            setAiSuggestion(null);
        }
    };

    const applyAiSuggestion = () => {
        if (aiSuggestion && aiSuggestion.rule) {
            setSelectedDomain(aiSuggestion.rule.domain);
            setSelectedTopic(aiSuggestion.rule.topic);
            setSelectedRule(aiSuggestion.rule);
        }
    };

    const reset = () => {
        setSelectedDomain(null);
        setSelectedTopic(null);
        setSelectedRule(null);
        setSearchTerm('');
        setAiInput('');
        setAiSuggestion(null);
    };

    // --- VIEW 1: DOMAIN SELECTION ---
    if (!selectedDomain) {
        return (
            <div>
                <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ChevronLeft size={24} color="var(--primary)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Can They Force Me?</h1>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select the domain</span>
                    </div>
                </div>

                {/* AI INPUT */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(145deg, #1E1E1E 0%, #111 100%)', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>AI Helper</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Describe situation (e.g. Police searching phone...)"
                        className="input"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', fontSize: '16px' }}
                        value={aiInput}
                        onChange={handleAiSearch}
                    />
                    {aiSuggestion && (
                        <div onClick={applyAiSuggestion} style={{ marginTop: '0.75rem', padding: '0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#eee' }}>Found rule: <strong>{aiSuggestion.rule.summary || aiSuggestion.rule.title}</strong></span>
                            <ChevronRight size={16} color="var(--primary)" />
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {getDomains().map(domain => (
                        <div key={domain} className="card" onClick={() => setSelectedDomain(domain)} style={{ flexDirection: 'row', alignItems: 'center', padding: '1rem' }}>
                            <div className="card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
                                {icons[domain] || <Scale size={24} />}
                            </div>
                            <div style={{ flex: 1, marginLeft: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>{domain}</div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- VIEW 2: RULE SELECTION (Grouped by Topic if needed, or nice list) ---
    if (!selectedRule) {
        // Filter rules
        const domainRules = getRules(selectedDomain);
        const filteredRules = domainRules.filter(r =>
            r.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.topic.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div>
                <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button onClick={() => { setSelectedDomain(null); setSearchTerm(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ChevronLeft size={24} color="var(--primary)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedDomain} Rules</h1>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tap to see your rights</span>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder={`Search ${selectedDomain} rules...`}
                        className="input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderRadius: '8px', padding: '0.75rem', fontSize: '16px' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredRules.map(rule => (
                        <div key={rule.rule_id} className="card" onClick={() => setSelectedRule(rule)} style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                {rule.topic}
                            </div>
                            <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '1rem' }}>{rule.summary}</div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700,
                                    background: rule.verdict === 'CANNOT' ? 'rgba(16, 185, 129, 0.2)' : (rule.verdict === 'CAN' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)'),
                                    color: rule.verdict === 'CANNOT' ? 'var(--success)' : (rule.verdict === 'CAN' ? 'var(--danger)' : '#facc15')
                                }}>
                                    {rule.verdict === 'CANNOT' ? 'NO, THEY CAN\'T' : (rule.verdict === 'CAN' ? 'YES, THEY CAN' : 'DISPUTED')}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredRules.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No rules found. Try asking the AI Helper.</div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW 3: RULE UNIT DETAIL ---
    const verdictColor = (selectedRule.verdict === 'CANNOT' || selectedRule.verdict === 'CANNOT_DO' || selectedRule.authority_level === 'ILLEGAL') ? 'var(--success)' :
        (selectedRule.verdict === 'CAN' || selectedRule.verdict === 'CAN_FINE' || selectedRule.verdict === 'MUST_STOP' || selectedRule.verdict === 'CAN_TEST') ? 'var(--danger)' : '#facc15';

    const verdictIcon = (selectedRule.verdict === 'CANNOT' || selectedRule.verdict === 'CANNOT_DO' || selectedRule.authority_level === 'ILLEGAL') ? <CheckCircle size={48} color={verdictColor} /> :
        (selectedRule.verdict === 'CAN' || selectedRule.verdict === 'CAN_FINE' || selectedRule.verdict === 'MUST_STOP') ? <AlertCircle size={48} color={verdictColor} /> : <Zap size={48} color={verdictColor} />;

    let verdictText = 'IT DEPENDS';
    if (selectedRule.verdict === 'CANNOT' || selectedRule.verdict === 'CANNOT_DO') verdictText = 'NO, THEY CANNOT';
    else if (selectedRule.verdict === 'CAN' || selectedRule.verdict === 'CAN_FINE' || selectedRule.verdict === 'CAN_ASK' || selectedRule.verdict === 'CAN_TEST') verdictText = 'YES, THEY CAN';
    else if (selectedRule.verdict === 'MUST_STOP') verdictText = 'YOU MUST STOP';
    else if (selectedRule.authority_level === 'ILLEGAL') verdictText = 'ILLEGAL ACT';
    else if (selectedRule.verdict) verdictText = selectedRule.verdict.replace(/_/g, ' ');

    return (
        <div>
            <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setSelectedRule(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} color="var(--primary)" />
                </button>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Back to List</span>
            </div>

            <div style={{ margin: '1rem 0' }}>
                <h2 style={{ fontSize: '1.4rem', lineHeight: 1.3 }}>{selectedRule.summary || selectedRule.title}</h2>
            </div>

            {/* VERDICT BOX (OR CLARIFICATION OPTIONS) */}
            {selectedRule.options ? (
                <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '1.1rem', color: '#eee', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        {selectedRule.simple_explanation}
                    </p>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {selectedRule.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    // Find and set the rule
                                    const linkedRule = rulesData.rules.find(r => r.rule_id === opt.rule_id);
                                    if (linkedRule) {
                                        setSelectedRule(linkedRule);
                                        setSelectedDomain(linkedRule.domain);
                                        setSelectedTopic(linkedRule.topic);
                                    }
                                }}
                                className="card"
                                style={{
                                    padding: '1.25rem',
                                    textAlign: 'left',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid #444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                {opt.label}
                                <ChevronRight size={20} color="var(--primary)" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="result-box" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem 1rem',
                    border: `1px solid ${verdictColor}`, borderColor: verdictColor, background: `linear-gradient(180deg, ${verdictColor}11 0%, transparent 100%)`
                }}>
                    {verdictIcon}
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0rem', color: verdictColor, textAlign: 'center' }}>
                        {verdictText}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {selectedRule.conditions && selectedRule.conditions.map((c, i) => (
                            <p key={i} style={{ fontWeight: 500, opacity: 0.9, textAlign: 'center' }}>{c}</p>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                {/* SCENARIO: POLICE SAYS */}
                {selectedRule.police_says && (
                    <div className="card" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                        <h3 className="label" style={{ color: 'var(--text-muted)' }}>If they say...</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {selectedRule.police_says.map((phrase, i) => (
                                <div key={i} style={{ fontSize: '1rem', color: '#fff', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <span style={{ opacity: 0.5 }}>"</span>{phrase}<span style={{ opacity: 0.5 }}>"</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SIMPLE EXPLANATION */}
                <div className="card" style={{ cursor: 'default' }}>
                    <h3 className="label" style={{ color: 'var(--text-muted)' }}>Explanation</h3>
                    <p style={{ color: 'var(--text)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                        {selectedRule.simple_explanation || selectedRule.what_this_means}
                    </p>

                    {/* EXPANDABLE DETAIL */}
                    <button
                        onClick={() => setIsDetailedOpen(!isDetailedOpen)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: 0, marginTop: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                        {isDetailedOpen ? "Show Less" : "Read More Info"} {isDetailedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isDetailedOpen && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                            <p style={{ fontSize: '0.95rem', color: '#ccc', lineHeight: 1.5 }}>
                                {selectedRule.detailed_explanation || selectedRule.what_happens_next || "No additional details available."}
                            </p>
                            {selectedRule.exceptions && selectedRule.exceptions.length > 0 && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <strong style={{ fontSize: '0.85rem', color: '#facc15' }}>Exceptions:</strong>
                                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', color: '#ccc', fontSize: '0.9rem' }}>
                                        {selectedRule.exceptions.map((ex, i) => <li key={i}>{ex}</li>)}
                                    </ul>
                                </div>
                            )}
                            {selectedRule.common_misconception && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <strong style={{ fontSize: '0.85rem', color: '#f87171' }}>Common Myth:</strong>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedRule.common_misconception}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* WHAT TO SAY */}
                <div className="card" style={{ cursor: 'default', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 className="label" style={{ color: 'var(--primary)', margin: 0 }}>What to Say</h3>
                        <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                        </button>
                    </div>

                    {selectedRule.what_you_can_say && Array.isArray(selectedRule.what_you_can_say) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedRule.what_you_can_say.map((line, i) => (
                                <p key={i} style={{ color: 'var(--text)', fontStyle: 'italic', fontSize: '1.1rem', fontWeight: 500, lineHeight: '1.5' }}>
                                    "{line}"
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text)', fontStyle: 'italic', fontSize: '1.1rem', fontWeight: 500, lineHeight: '1.5' }}>
                            "{selectedRule.what_to_say}"
                        </p>
                    )}
                </div>

                {/* WHAT NOT TO SAY (BAD IDEA) */}
                {selectedRule.what_not_to_say && (
                    <div className="card" style={{ cursor: 'default', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--danger)' }}>
                        <h3 className="label" style={{ color: 'var(--danger)', margin: 0 }}>Never Say This</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {selectedRule.what_not_to_say.map((line, i) => (
                                <p key={i} style={{ color: 'var(--text)', fontSize: '1rem', textDecoration: 'line-through', opacity: 0.8 }}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* SOURCE */}
                {selectedRule.source_category && (
                    <div className="card" style={{ cursor: 'pointer', padding: '0.5rem 1rem' }} onClick={() => setIsSourceOpen(!isSourceOpen)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <BookOpen size={16} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Source</span>
                            </div>
                            {isSourceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {isSourceOpen && (
                            <div style={{ marginTop: '0.75rem', borderTop: '1px solid #333', paddingTop: '0.75rem' }}>
                                <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                    Based on: <strong style={{ color: 'white' }}>{selectedRule.source_category}</strong>
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                    Note: Laws may be subject to amendments. This is for information only.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button className="btn btn-ghost" style={{ marginTop: '2rem' }} onClick={reset}>
                Check Another Rule
            </button>
        </div>
    );
};

export default AuthorityChecker;
