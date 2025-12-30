import React, { useState, useEffect } from 'react';
import schemesData from '../data/schemes.json';
import statesData from '../data/states.json';
import { ChevronLeft, Info, CheckCircle, Search, ChevronDown, ExternalLink, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EligibilityChecker = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('input');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingDiscovery, setLoadingDiscovery] = useState(false);
    const [discoveredSchemes, setDiscoveredSchemes] = useState([]);

    const [formData, setFormData] = useState({
        ageRange: '18-25',
        incomeRange: 'Below 2.5L',
        category: 'General',
        situation: 'student',
        state: 'Delhi',
        gender: 'male'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- LOGIC 1: VERIFIED ELIGIBILITY (Internal Database) ---
    const runVerifiedEligibility = () => {
        let incomeMax = 250000;
        if (formData.incomeRange === '2.5L - 5L') incomeMax = 500000;
        if (formData.incomeRange === '5L - 8L') incomeMax = 800000;
        if (formData.incomeRange === 'Above 8L') incomeMax = 99999999;

        let ageMin = 0;
        let ageMax = 100;
        if (formData.ageRange === 'Below 18') { ageMax = 17; }
        if (formData.ageRange === '18-25') { ageMin = 18; ageMax = 25; }
        if (formData.ageRange === '26-35') { ageMin = 26; ageMax = 35; }
        if (formData.ageRange === '36-60') { ageMin = 36; ageMax = 60; }
        if (formData.ageRange === 'Above 60') { ageMin = 60; }

        return schemesData.filter(scheme => {
            const c = scheme.criteria;
            // Income Check
            if (c.income_max && incomeMax > c.income_max) return false;
            // Age Check
            if (c.age_max && ageMin > c.age_max) return false;
            if (c.age_min && ageMax < c.age_min) return false;
            // Category Check
            if (c.category && !c.category.includes(formData.category)) return false;
            // Gender Check
            if (c.gender && c.gender !== formData.gender) return false;
            // Situation
            if (c.situation && !c.situation.includes(formData.situation)) return false;

            return true;
        });
    };

    const verifiedSchemes = runVerifiedEligibility().filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.benefit_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- LOGIC 2: INTERNET DISCOVERY (Simulated) ---
    // In a real app, this would call an API (e.g., Perplexity, Google Custom Search).
    // Here we simulate "Discovery" based on user inputs to show the UX.
    const simulateInternetDiscovery = () => {
        setLoadingDiscovery(true);

        // Mock "Internet Found" Database
        const potentialDiscoveries = [
            {
                name: `${formData.state} Educational Loan Scheme`,
                description: "Low-interest loans for students pursuing higher education within the state.",
                situation: "student",
                url: `https://Google.com/search?q=${formData.state}+education+loan+scheme`
            },
            {
                name: "National Career Service Registration",
                description: "Online portal for job matching and career counseling services.",
                situation: ["student", "unemployed", "employee"],
                url: "https://www.ncs.gov.in/"
            },
            {
                name: "Prime Minister's Employment Generation Programme (PMEGP)",
                description: "Credit-linked subsidy programme for generating self-employment opportunities.",
                situation: ["unemployed", "entrepreneur"],
                url: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp"
            },
            {
                name: `${formData.state} Widow Pension Scheme`,
                description: "Financial assistance for widows living below the poverty line.",
                situation: ["parent", "senior"], // Rough mapping
                gender: "female",
                url: `https://www.google.com/search?q=${formData.state}+widow+pension+scheme`
            },
            {
                name: "Atal Pension Yojana (APY)",
                description: "Pension scheme for citizens of India focused on the unorganized sector workers.",
                situation: ["employee", "farmer", "unemployed"],
                url: "https://www.npscra.nsdl.co.in/scheme-details.php"
            },
            {
                name: "Skill India Training Program",
                description: "Vocational training courses to improve employability.",
                situation: ["student", "unemployed"],
                url: "https://www.skillindia.gov.in/"
            }
        ];

        // Filter mocks based on rough situation match to simulate "AI Relevance"
        const relevant = potentialDiscoveries.filter(d => {
            const sitMatch = Array.isArray(d.situation)
                ? d.situation.includes(formData.situation)
                : d.situation === formData.situation;

            const genderMatch = d.gender ? d.gender === formData.gender : true;

            return sitMatch && genderMatch;
        });

        setTimeout(() => {
            setDiscoveredSchemes(relevant);
            setLoadingDiscovery(false);
        }, 1200); // 1.2s delay for "Checking..." effect
    };

    useEffect(() => {
        if (step === 'result') {
            simulateInternetDiscovery();
        }
    }, [step]);


    if (step === 'input') {
        return (
            <div className="fade-in">
                <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-bg">
                        <ChevronLeft size={24} color="var(--text)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Am I Eligible?</h1>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Find benefits & entitlements verified for you</span>
                    </div>
                </div>

                <div className="card" style={{ cursor: 'default', padding: '1.5rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* INPUT GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* 1. Age Range */}
                            <div>
                                <label className="label">Age Group</label>
                                <select className="select" name="ageRange" value={formData.ageRange} onChange={handleChange} style={{ width: '100%' }}>
                                    <option value="Below 18">Below 18</option>
                                    <option value="18-25">18 - 25</option>
                                    <option value="26-35">26 - 35</option>
                                    <option value="36-60">36 - 60</option>
                                    <option value="Above 60">Above 60</option>
                                </select>
                            </div>

                            {/* 2. Gender */}
                            <div>
                                <label className="label">Gender</label>
                                <select className="select" name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%' }}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. Income Range */}
                        <div>
                            <label className="label">Annual Family Income</label>
                            <select className="select" name="incomeRange" value={formData.incomeRange} onChange={handleChange}>
                                <option value="Below 2.5L">Below ₹2.5 Lakh</option>
                                <option value="2.5L - 5L">₹2.5L - ₹5L</option>
                                <option value="5L - 8L">₹5L - ₹8L</option>
                                <option value="Above 8L">Above ₹8L</option>
                            </select>
                        </div>

                        {/* 4. Category */}
                        <div>
                            <label className="label">Category</label>
                            <select className="select" name="category" value={formData.category} onChange={handleChange}>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="EWS">EWS (Economically Weaker)</option>
                                <option value="Other">Not Applicable</option>
                            </select>
                        </div>

                        {/* 5. State */}
                        <div>
                            <label className="label">State</label>
                            <select className="select" name="state" value={formData.state} onChange={handleChange}>
                                {statesData.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* 6. Situation */}
                        <div>
                            <label className="label">Current Situation</label>
                            <select className="select" name="situation" value={formData.situation} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="employee">Employed</option>
                                <option value="unemployed">Unemployed</option>
                                <option value="farmer">Farmer</option>
                                <option value="senior">Senior Citizen</option>
                                <option value="parent">Parent</option>
                            </select>
                        </div>

                        <button className="btn btn-primary" onClick={() => setStep('result')} style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1rem' }}>
                            Check Eligibility
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // RESULTS VIEW
    return (
        <div className="fade-in" style={{ paddingBottom: '4rem' }}>
            <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', position: 'sticky', top: 0, zIndex: 10, background: '#09090b', paddingBottom: '1rem', paddingTop: '1rem' }}>
                <button onClick={() => setStep('input')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-bg">
                    <ChevronLeft size={24} color="var(--text)" />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Results</h1>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Based on your profile
                    </span>
                </div>
            </div>

            {/* SECTION 1: VERIFIED ELIGIBILITY (GREEN) */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    color: '#4ade80', // Green
                    background: 'rgba(74, 222, 128, 0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(74, 222, 128, 0.2)'
                }}>
                    <ShieldCheck size={20} />
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Verified schemes you may be eligible for</h2>
                </div>

                {verifiedSchemes.length === 0 ? (
                    <div className="result-box" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', border: '1px dashed var(--border)', padding: '2rem', textAlign: 'center' }}>
                        <p>No verified schemes matched your exact criteria in our internal database.</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Check the "Internet Discovery" section below for more options.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {verifiedSchemes.map(scheme => (
                            <div key={scheme.id} className="card" style={{
                                cursor: 'default',
                                padding: '0',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                overflow: 'hidden'
                            }}>
                                {/* Verified Header */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    background: 'linear-gradient(to right, rgba(74, 222, 128, 0.1), transparent)',
                                    borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>
                                            {scheme.benefit_type}
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 600 }}>{scheme.name}</h3>
                                    </div>
                                    <div style={{ background: '#4ade80', color: '#000', padding: '4px', borderRadius: '50%' }}>
                                        <CheckCircle size={16} />
                                    </div>
                                </div>

                                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                                        {scheme.description}
                                    </p>

                                    {/* Why you qualify */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Why You Qualify</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                            <CheckCircle size={16} color="#4ade80" style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <p style={{ fontSize: '0.9rem', color: '#e0e0e0', margin: 0 }}>{scheme.eligibility_reason}</p>
                                        </div>
                                    </div>

                                    {/* Accordion for Details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                        <details style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <summary style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>How to Apply</span> <ChevronDown size={14} />
                                            </summary>
                                            <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.9rem', color: '#ccc', lineHeight: 1.5 }}>
                                                {scheme.how_to_apply}
                                            </div>
                                        </details>

                                        <details style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <summary style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Documents Required</span> <ChevronDown size={14} />
                                            </summary>
                                            <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.9rem', color: '#ccc' }}>
                                                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                    {scheme.documents.map((d, i) => <li key={i} style={{ marginBottom: '4px' }}>{d}</li>)}
                                                </ul>
                                            </div>
                                        </details>
                                    </div>

                                    <a
                                        href={scheme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn"
                                        style={{
                                            background: '#4ade80',
                                            color: '#000',
                                            textDecoration: 'none',
                                            padding: '0.85rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            borderRadius: '8px',
                                            marginTop: '0.5rem'
                                        }}
                                    >
                                        Visit Official Website <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION 2: INTERNET DISCOVERY (BLUE/GREY) */}
            <div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    color: '#60a5fa', // Blue
                    background: 'rgba(96, 165, 250, 0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(96, 165, 250, 0.2)'
                }}>
                    <Globe size={20} />
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Other schemes found online (not verified)</h2>
                </div>

                {loadingDiscovery ? (
                    <div className="discovery-skeleton-grid">
                        <div className="skeleton-card shimmer" style={{ height: '100px' }}></div>
                        <div className="skeleton-card shimmer" style={{ height: '100px' }}></div>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reviewing eligibility criteria...</p>
                    </div>
                ) : discoveredSchemes.length === 0 ? (
                    <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                        No additional schemes found online for this category.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {discoveredSchemes.map((scheme, index) => (
                            <div key={index} className="card" style={{
                                padding: '1.25rem',
                                cursor: 'default',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderLeft: '4px solid #60a5fa' // Blue accent
                            }}>
                                <h3 style={{ fontSize: '1.1rem', color: '#e0e0e0', margin: '0 0 0.5rem 0' }}>{scheme.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    {scheme.description}
                                </p>
                                <a
                                    href={scheme.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#60a5fa',
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Check eligibility on official site <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* DISCLAIMER */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255, 193, 7, 0.05)',
                    border: '1px solid rgba(255, 193, 7, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'start'
                }}>
                    <AlertCircle size={18} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
                        <strong>Note:</strong> These schemes are listed for discovery based on your profile.
                        Eligibility and availability must be verified directly on the official website.
                        The app does not guarantee eligibility for unverified schemes.
                    </span>
                </div>
            </div>

        </div>
    );
};

export default EligibilityChecker;

