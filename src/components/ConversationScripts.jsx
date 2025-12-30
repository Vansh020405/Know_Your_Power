import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Shield, MessageCircle, Briefcase, X, AlertTriangle, GraduationCap, ClipboardCheck, Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import scriptsData from '../data/conversation_scripts.json';
import '../styles/ConversationScripts.css';

const ConversationScripts = () => {
    const navigate = useNavigate();
    const [selectedScript, setSelectedScript] = useState(null);
    const [expandedStep, setExpandedStep] = useState(null);

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
            'College / University Admin': '#8b5cf6'
        };
        return colors[category] || '#10b981';
    };

    const getCategoryBg = (category) => {
        const colors = {
            'Traffic Police': 'rgba(239, 68, 68, 0.1)',
            'HR / Workplace': 'rgba(59, 130, 246, 0.1)',
            'College / University Admin': 'rgba(139, 92, 246, 0.1)'
        };
        return colors[category] || 'rgba(16, 185, 129, 0.1)';
    };

    if (selectedScript) {
        const script = scriptsData.scripts.find(s => s.id === selectedScript);
        const IconComponent = iconMap[script.icon];

        return (
            <div className="conversation-detail">
                {/* Header */}
                <div className="script-header">
                    <button
                        onClick={() => setSelectedScript(null)}
                        className="back-button"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <div className="script-category" style={{ color: getCategoryColor(script.category) }}>
                            {script.category}
                        </div>
                        <h1 className="script-title">{script.title}</h1>
                    </div>
                </div>

                {/* Steps */}
                <div className="steps-container">
                    {script.steps.map((step, index) => (
                        <div
                            key={index}
                            className={`step-card ${expandedStep === index ? 'expanded' : ''}`}
                        >
                            {/* Step Number */}
                            <div className="step-number">Step {step.stepNumber}</div>

                            {/* What They Might Say */}
                            <div
                                className="step-section they-say"
                                onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                            >
                                <div className="section-header">
                                    <span className="section-label">🔴 They might say:</span>
                                    <ChevronRight
                                        size={20}
                                        className={`toggle-icon ${expandedStep === index ? 'rotated' : ''}`}
                                    />
                                </div>
                                <p className="section-content">{step.theyMight}</p>
                            </div>

                            {/* Expandable Content */}
                            {expandedStep === index && (
                                <div className="expanded-content">
                                    {/* You Can Say */}
                                    <div className="step-section you-say">
                                        <div className="section-label">🟢 You can say:</div>
                                        <p className="section-content">{step.youCanSay}</p>
                                    </div>

                                    {/* What It Means */}
                                    <div className="step-section what-means">
                                        <div className="section-label">💡 What this means:</div>
                                        <p className="section-content">{step.whatItMeans}</p>
                                    </div>

                                    {/* What Happens Next */}
                                    <div className="step-section what-next">
                                        <div className="section-label">⏭️ What usually happens next:</div>
                                        <p className="section-content">{step.whatHappensNext}</p>
                                    </div>

                                    {/* What NOT to Say */}
                                    {step.avoidSaying && (
                                        <div className="step-section avoid-say">
                                            <div className="section-label warning">⚠️ What NOT to say:</div>
                                            <p className="section-content warning-text">{step.avoidSaying}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="scripts-footer">
                    <AlertCircle size={16} />
                    <p>Remember: Stay calm, respectful, and document everything. These scripts are guides, not legal advice.</p>
                </div>
            </div>
        );
    }

    // Category View
    const categories = [...new Set(scriptsData.scripts.map(s => s.category))];

    return (
        <div className="scripts-container">
            {/* Header */}
            <div className="scripts-header">
                <h1>Conversation Scripts</h1>
                <p>Real-life conversation flows for authority interactions. Learn what to say and what NOT to say.</p>
            </div>

            {/* Scripts by Category */}
            {categories.map((category) => (
                <div key={category} className="category-section">
                    <h2 className="category-title" style={{ borderLeft: `4px solid ${getCategoryColor(category)}` }}>
                        {category}
                    </h2>

                    <div className="scripts-grid">
                        {scriptsData.scripts
                            .filter(s => s.category === category)
                            .map((script) => {
                                const IconComponent = iconMap[script.icon];
                                return (
                                    <button
                                        key={script.id}
                                        className="script-card"
                                        onClick={() => setSelectedScript(script.id)}
                                        style={{
                                            backgroundColor: getCategoryBg(category),
                                            borderLeft: `4px solid ${getCategoryColor(category)}`
                                        }}
                                    >
                                        <div className="script-card-icon">
                                            {IconComponent && <IconComponent size={28} />}
                                        </div>
                                        <div className="script-card-content">
                                            <h3>{script.title}</h3>
                                            <p>{script.steps.length} steps</p>
                                        </div>
                                        <ChevronRight size={20} className="card-arrow" />
                                    </button>
                                );
                            })}
                    </div>
                </div>
            ))}

            {/* Bottom Note */}
            <div className="scripts-info">
                <div className="info-card">
                    <h3>💬 How to Use</h3>
                    <p>Read through conversations before you need them. In a real situation, stay calm and remember: you have rights.</p>
                </div>
                <div className="info-card">
                    <h3>📋 Key Principles</h3>
                    <p>Always ask for written documentation. Be respectful but firm. Don't sign anything without understanding it.</p>
                </div>
            </div>
        </div>
    );
};

export default ConversationScripts;
