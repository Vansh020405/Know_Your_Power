import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Shield,
    MessageCircle,
    Briefcase,
    X,
    AlertTriangle,
    GraduationCap,
    ClipboardCheck,
    Hand,
    Search,
    User,
    ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import scriptsData from '../data/conversation_scripts.json';
import '../styles/ConversationScripts.css';

const ConversationScripts = () => {
    const navigate = useNavigate();
    const [selectedScript, setSelectedScript] = useState(null);
    const [expandedStep, setExpandedStep] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const iconMap = {
        AlertCircle,
        Shield,
        MessageCircle,
        Briefcase,
        X,
        AlertTriangle,
        GraduationCap,
        ClipboardCheck,
        Hand
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Traffic Police': '#ef4444',
            'HR / Workplace': '#3b82f6',
            'College / University Admin': '#A855F7'
        };
        return colors[category] || '#10b981';
    };

    const categories = ['All', ...new Set(scriptsData.scripts.map(s => s.category))];

    const handleScriptSelect = (id) => {
        setIsDetailLoading(true);
        setTimeout(() => {
            setSelectedScript(id);
            setIsDetailLoading(false);
            window.scrollTo(0, 0);
        }, 450); // Intentional delay for perceived depth
    };

    const filteredScripts = useMemo(() => {
        return scriptsData.scripts.filter(script => {
            const matchesCategory = activeCategory === 'All' || script.category === activeCategory;
            const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                script.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, activeCategory]);

    if (isDetailLoading) {
        return (
            <div className="page-loading-overlay">
                <div className="skeleton-card shimmer" style={{ height: '80px' }}></div>
                <div className="skeleton-card shimmer" style={{ height: '400px' }}></div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Preparing conversation flow...</p>
            </div>
        );
    }

    if (selectedScript) {
        const script = scriptsData.scripts.find(s => s.id === selectedScript);

        return (
            <div className="conversation-detail fade-in">
                {/* Header */}
                <div className="script-header-container">
                    <div className="script-header-blur"></div>
                    <div className="script-header-content">
                        <button
                            onClick={() => {
                                setSelectedScript(null);
                                setExpandedStep(null);
                            }}
                            className="back-button-floating"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="title-stack">
                            <span className="pill-badge" style={{ backgroundColor: `${getCategoryColor(script.category)}20`, color: getCategoryColor(script.category) }}>
                                {script.category}
                            </span>
                            <h1 className="script-title-large">{script.title}</h1>
                        </div>
                    </div>
                </div>

                {/* Steps Flow */}
                <div className="conversation-flow">
                    <div className="flow-line"></div>
                    {script.steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flow-step ${expandedStep === index ? 'is-expanded' : ''}`}
                        >
                            <div className="step-indicator">
                                <span className="step-dot"></span>
                                <span className="step-count">{index + 1}</span>
                            </div>

                            <div className="step-content-box">
                                {/* Dialogue: They Might Say */}
                                <div
                                    className="dialogue-cloud they-cloud"
                                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                                >
                                    <div className="cloud-header">
                                        <div className="avatar authority">
                                            <ShieldAlert size={16} />
                                        </div>
                                        <span className="speaker-name">Authority might say:</span>
                                    </div>
                                    <p className="cloud-text">{step.theyMight}</p>
                                    <div className="cloud-footer">
                                        <span className="expand-hint">{expandedStep === index ? 'Tap to close' : 'Tap to see response'}</span>
                                        <ChevronDown size={14} className={`chevron-anim ${expandedStep === index ? 'rotated' : ''}`} />
                                    </div>
                                </div>

                                {/* Expandable Detail Area */}
                                {expandedStep === index && (
                                    <div className="step-details-expansion fade-in">
                                        {/* You Can Say */}
                                        <div className="dialogue-cloud you-cloud">
                                            <div className="cloud-header">
                                                <div className="avatar citizen">
                                                    <User size={16} />
                                                </div>
                                                <span className="speaker-name">You can say:</span>
                                            </div>
                                            <p className="cloud-text highlight-text">{step.youCanSay}</p>
                                        </div>

                                        {/* Context Cards */}
                                        <div className="context-grid">
                                            <div className="context-card meaning">
                                                <div className="card-lbl">💡 Context</div>
                                                <p>{step.whatItMeans}</p>
                                            </div>
                                            <div className="context-card next">
                                                <div className="card-lbl">⏭️ Next Step</div>
                                                <p>{step.whatHappensNext}</p>
                                            </div>
                                        </div>

                                        {/* Warning Box */}
                                        {step.avoidSaying && (
                                            <div className="warning-box">
                                                <div className="warning-lbl">
                                                    <AlertTriangle size={16} /> WHAT NOT TO SAY
                                                </div>
                                                <p>{step.avoidSaying}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Advice */}
                <div className="scripts-sticky-footer">
                    <div className="advice-pill">
                        <AlertCircle size={18} />
                        <span>Stay calm. Speak slowly. Record if possible.</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="scripts-page-v2 fade-in">
            {/* Hero Section */}
            <div className="scripts-hero">
                <div className="hero-glow-scripts"></div>
                <h1 className="hero-title-main">Conversation <span className="gradient-text">Mastery</span></h1>
                <p className="hero-subtitle">Scripted responses for real-world interactions with authorities. Be prepared, not surprised.</p>

                {/* Search & Filter Bar */}
                <div className="search-filter-container">
                    <div className="search-bar-wrap">
                        <Search className="search-icon-fixed" size={20} />
                        <input
                            type="text"
                            placeholder="Search situations (e.g. traffic, boss, ragging)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && <X size={18} className="clear-search" onClick={() => setSearchTerm('')} />}
                    </div>
                </div>

                <div className="category-chips">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`chip-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="scripts-layout">
                {filteredScripts.length > 0 ? (
                    <div className="scripts-modern-grid">
                        {filteredScripts.map((script) => {
                            const IconComponent = iconMap[script.icon] || MessageCircle;
                            const catColor = getCategoryColor(script.category);

                            return (
                                <div
                                    key={script.id}
                                    className="modern-script-card"
                                    onClick={() => handleScriptSelect(script.id)}
                                >
                                    <div className="card-edge" style={{ backgroundColor: catColor }}></div>
                                    <div className="card-main-content">
                                        <div className="card-top">
                                            <div className="card-icon-box" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
                                                <IconComponent size={24} />
                                            </div>
                                            <span className="card-cat-label" style={{ color: catColor }}>{script.category}</span>
                                        </div>
                                        <h3 className="card-heading">{script.title}</h3>
                                        <div className="card-bottom">
                                            <div className="step-tab">
                                                <span className="step-dot-small"></span>
                                                {script.steps.length} Steps
                                            </div>
                                            <div className="card-action-link">
                                                View Script <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-scripts-found">
                        <MessageCircle size={48} className="empty-icon" />
                        <h3>No scripts found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Quick Principles Section */}
            <div className="principles-section">
                <h2 className="section-title-sm">Foundational Rules</h2>
                <div className="principles-row">
                    <div className="principle-item">
                        <div className="p-num">01</div>
                        <h4>Silence is your Right</h4>
                        <p>You are not obligated to explain your life or prove your innocence on the spot.</p>
                    </div>
                    <div className="principle-item">
                        <div className="p-num Jury">02</div>
                        <h4>Remain Respectful</h4>
                        <p>Firmness does not require rudeness. Calmness is your greatest weapon.</p>
                    </div>
                    <div className="principle-item">
                        <div className="p-num">03</div>
                        <h4>Ask for Grounds</h4>
                        <p>Always ask: "On what legal grounds is this being requested?"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal utility component for the chevron in details
const ChevronDown = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default ConversationScripts;
