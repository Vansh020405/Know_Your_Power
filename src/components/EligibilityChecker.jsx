import React, { useState } from 'react';
import schemesData from '../data/schemes.json';
import statesData from '../data/states.json';
import { ChevronLeft, Info, CheckCircle, Search, ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EligibilityChecker = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('input');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        ageRange: '18-25',
        incomeRange: 'Below 2.5L',
        category: 'General',
        situation: 'student',
        state: 'Delhi',
        gender: 'male' // Hidden internal logic, kept default
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const runEligibilityLogic = () => {
        // Simple mapping logic to match JSON criteria
        // In a real app, ranges would be numerical. Here we map strings.

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

            // Situation
            if (c.situation && !c.situation.includes(formData.situation)) return false;

            return true;
        });
    };

    const eligibleSchemes = runEligibilityLogic();

    // Search Filter
    const filteredSchemes = eligibleSchemes.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.benefit_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (step === 'input') {
        return (
            <div>
                <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ChevronLeft size={24} color="var(--primary)" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Am I Eligible?</h1>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Find benefits & entitlements</span>
                    </div>
                </div>

                <div className="card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* 1. Age Range */}
                        <div>
                            <label className="label">Age Group</label>
                            <select className="select" name="ageRange" value={formData.ageRange} onChange={handleChange}>
                                <option value="Below 18">Below 18</option>
                                <option value="18-25">18 - 25</option>
                                <option value="26-35">26 - 35</option>
                                <option value="36-60">36 - 60</option>
                                <option value="Above 60">Above 60</option>
                            </select>
                        </div>

                        {/* 2. Income Range */}
                        <div>
                            <label className="label">Annual Family Income</label>
                            <select className="select" name="incomeRange" value={formData.incomeRange} onChange={handleChange}>
                                <option value="Below 2.5L">Below ₹2.5 Lakh</option>
                                <option value="2.5L - 5L">₹2.5L - ₹5L</option>
                                <option value="5L - 8L">₹5L - ₹8L</option>
                                <option value="Above 8L">Above ₹8L</option>
                            </select>
                        </div>

                        {/* 3. Category */}
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

                        {/* 4. State */}
                        <div>
                            <label className="label">State</label>
                            <select className="select" name="state" value={formData.state} onChange={handleChange}>
                                {statesData.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* 5. Situation */}
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

                        <button className="btn btn-primary" onClick={() => setStep('result')} style={{ marginTop: '0.5rem' }}>
                            Check Eligibility
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // RESULTS VIEW
    return (
        <div>
            <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <button onClick={() => setStep('input')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} color="var(--primary)" />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Results</h1>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {filteredSchemes.length} Benefits Found
                    </span>
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{ padding: '0.75rem', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#ffcc00', display: 'flex', gap: '0.5rem' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>Eligibility is based on available official information. Final approval depends on government verification.</span>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search benefits (e.g. fee, health)..."
                    className="input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '16px' }}
                />
            </div>

            {
                filteredSchemes.length === 0 ? (
                    <div className="result-box result-no" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
                        <p>No matching verified benefits found based on current details.</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Try changing the Income or Category filters, or check the unverified suggestions below.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Layer 1: Verified Schemes */}
                        {filteredSchemes.map(scheme => (
                            <div key={scheme.id} className="card" style={{ cursor: 'default', padding: '1.25rem', gap: '1rem', borderTop: '4px solid var(--primary)' }}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{scheme.benefit_type}</div>
                                        <h2 style={{ fontSize: '1.15rem', color: 'var(--primary)', lineHeight: 1.2 }}>{scheme.name}</h2>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', fontWeight: 600 }}>Eligible</span>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                                    {scheme.description}
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Why You Qualify</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{scheme.eligibility_reason}</p>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>What You Get</h4>
                                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {scheme.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    {/* Layer 3: Official Link */}
                                    <a
                                        href={scheme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ flex: 1, textDecoration: 'none', padding: '0.75rem', fontSize: '0.9rem' }}
                                    >
                                        Official Source <CheckCircle size={16} style={{ marginLeft: '6px' }} />
                                    </a>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                    <details style={{ background: 'none', border: 'none' }}>
                                        <summary style={{ padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Documents Required <ChevronDown size={14} />
                                        </summary>
                                        <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                                            <p style={{ color: 'var(--text-muted)' }}>{scheme.documents.join(', ')}</p>
                                        </div>
                                    </details>
                                </div>

                            </div>
                        ))}
                    </div>
                )
            }

            {/* Optional Section: Unverified Web Results */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={16} /> Other Possible Schemes (Not Verified)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    {/* Mock Unverified Results based on situation */}
                    <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>State {formData.state} Welfare Scheme (General)</div>
                        <a href={`https://www.google.com/search?q=${formData.state}+welfare+schemes+for+${formData.situation}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#6ab0ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Search on Web <ChevronRight size={12} />
                        </a>
                    </div>

                    <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>National Portal of India</div>
                        <a href="https://www.india.gov.in/my-government/schemes" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#6ab0ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Browse All Schemes <ChevronRight size={12} />
                        </a>
                    </div>
                </div>
            </div>

            <button className="btn btn-ghost" style={{ marginTop: '2rem', marginBottom: '2rem' }} onClick={() => setStep('input')}>
                Check for someone else
            </button>
        </div>
    );
};

export default EligibilityChecker;
