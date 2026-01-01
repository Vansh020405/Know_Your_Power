import React, { useState } from 'react';
import {
    FileText,
    Shield,
    Briefcase,
    GraduationCap,
    ShoppingCart,
    Globe,
    Megaphone,
    AlertTriangle,
    Info,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Download,
    Copy
} from 'lucide-react';
import '../styles/Complaint.css';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { id: 'theft', label: 'Theft / Loss', icon: Shield, desc: 'Mobile, Wallet, Documents' },
    { id: 'harassment', label: 'Harassment', icon: AlertTriangle, desc: 'Stalking, Abuse, Threats' },
    { id: 'workplace', label: 'Workplace', icon: Briefcase, desc: 'Salary, Termination, POSH' },
    { id: 'college', label: 'College / University', icon: GraduationCap, desc: 'Fees, Ragging, Docs' },
    { id: 'consumer', label: 'Consumer', icon: ShoppingCart, desc: 'Defective Product, Service' },
    { id: 'cyber', label: 'Online Fraud', icon: Globe, desc: 'UPI Scam, Phishing, Hacking' },
    { id: 'civic', label: 'Civic Issue', icon: Megaphone, desc: 'Noise, Garbage, Roads' }
];

const ComplaintDrafter = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        location: '',
        incidentDetails: '',
        opponentName: '', // Specific person/entity involved
        evidence: ''      // Brief mention of evidence
    });

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const generateDraft = () => {
        const { date, location, incidentDetails, opponentName, evidence } = formData;
        const name = user?.name || "[My Name]";
        const contact = user?.email || "[My Contact Info]";
        const today = new Date().toLocaleDateString();

        let subject = "";
        let body = "";
        let authority = "";

        switch (selectedCategory) {
            case 'theft':
                authority = "The Station House Officer (SHO)";
                subject = "Complaint regarding Theft/Loss of Personal Belongings";
                body = `I am writing to report the theft/loss of my belongings which occurred on ${date} at approximately [Time]. The incident took place at ${location}.\n\nThe stolen items include: ${incidentDetails}.\n\nI request you to kindly register my complaint and help me in tracing the missing items. I require an acknowledgment of this complaint for obtaining duplicate documents/SIM details.`;
                break;
            case 'harassment':
                authority = "The Station House Officer (SHO) / Cyber Cell";
                subject = "Formal Complaint regarding Harassment";
                body = `I wish to file a formal complaint regarding persistent harassment faced by me. The incidents occurred around ${date} at ${location}.\n\nThe person involved is ${opponentName || "an unknown individual"}. The details of the harassment are as follows: ${incidentDetails}.\n\nThis has caused me significant mental distress and I fear for my safety. I request you to take immediate legal action.`;
                break;
            case 'workplace':
                authority = "The HR Manager / Labour Commissioner";
                subject = "Grievance regarding Workplace Issue";
                body = `I am an employee (Emp ID: [ID]) having worked from [Start Date]. I am writing to formally raise a grievance regarding ${incidentDetails} involving ${opponentName}.\n\nDespite my previous attempts to resolve this on [Date], no action has been taken. This is in potential violation of labor laws/company policy.\n\nI request a formal inquiry and immediate resolution.`;
                break;
            case 'college':
                authority = "The Principal / Dean of Student Affairs";
                subject = "Formal Complaint regarding University/College Issue";
                body = `I am a student of [Course/Year], Roll No: [Roll No]. I am facing a serious issue regarding ${incidentDetails} which occurred on ${date}.\n\nThe issue involves ${opponentName}. I have attached necessary proof (${evidence || "documents"}). I request you to kindly intervene and resolve this matter urgently.`;
                break;
            case 'consumer':
                authority = "The Manager / Consumer Forum";
                subject = "Complaint regarding Defective Product/Service Deficiency";
                body = `I purchased a [Product Name] on ${date} from ${location} (Invoice No: [No]).\n\nThe product is defective/service deficient as: ${incidentDetails}.\n\nDespite repeated requests to ${opponentName}, the issue remains unresolved. I demand a replacement/refund/correction of service within 7 days, failing which I will be forced to approach the Consumer Forum.`;
                break;
            case 'cyber':
                authority = "Cyber Crime Cell / Bank Manager";
                subject = "Report of Online Financial Fraud / Cyber Crime";
                body = `I am writing to report a cyber fraud incident that occurred on ${date}. An amount of [Amount] was deducted from my account/wallet regarding ${incidentDetails}.\n\nThe transaction was made to ${opponentName || "unknown beneficiary"}. I have not authorized this transaction. I request you to block the beneficiary account and help retrieve my funds.`;
                break;
            case 'civic':
                authority = "The Municipal Commissioner / Local Police Station";
                subject = "Complaint regarding Public Nuisance/Civic Issue";
                body = `I reside at [My Address]. I wish to draw your attention to a civic issue at ${location} observed on ${date}.\n\nThe issue is: ${incidentDetails}. This is causing severe inconvenience to residents and potential health/safety hazards.\n\nI request the concerned department to take inspection and necessary action immediately.`;
                break;
        }

        return {
            authority,
            date: today,
            from: `${name}\n${contact}`,
            subject,
            body: `${body}\n\nEvidence Available: ${evidence || "None at the moment"}.\n\nSincerely,\n${name}`
        };
    };

    const draft = step === 3 ? generateDraft() : null;

    const copyToClipboard = () => {
        const text = `To,\n${draft.authority}\n\nFrom:\n${draft.from}\n\nSubject: ${draft.subject}\n\nRespected Sir/Madam,\n\n${draft.body}`;
        navigator.clipboard.writeText(text);
        alert("Draft copied to clipboard!");
    };

    return (
        <div className="complaint-page">
            <div className="complaint-header">
                <h1 className="complaint-title">Complaint Drafter</h1>
                <p className="complaint-subtitle">Professional guidance to help you articulate your grievance clearly. We do not file complaints; we help you write them.</p>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer-banner">
                <Info size={24} style={{ flexShrink: 0 }} />
                <div>
                    <strong>IMPORTANT:</strong> This tool helps you draft a complaint for your reference.
                    You must submit it yourself to the relevant authority (Police, HR, Admin, etc.).
                    The app/developers are not law enforcement and do not take action on your behalf.
                </div>
            </div>

            {/* Stepper */}
            <div className="complaint-stepper">
                <div className="step-line"></div>
                {[1, 2, 3].map(s => (
                    <div key={s} className={`stepper-item ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                        <div className="step-circle">
                            {step > s ? <CheckCircle size={18} /> : s}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                            {s === 1 ? 'Category' : s === 2 ? 'Details' : 'Review'}
                        </span>
                    </div>
                ))}
            </div>

            {/* STEP 1: CATEGORY */}
            {step === 1 && (
                <div className="category-grid">
                    {CATEGORIES.map(cat => (
                        <div
                            key={cat.id}
                            className={`category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <div className="cat-icon"><cat.icon size={28} /></div>
                            <h3>{cat.label}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{cat.desc}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* STEP 2: FORM */}
            {step === 2 && (
                <div className="form-container">
                    <div className="form-group">
                        <label className="form-label">Incident Date & Time</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., 12th Aug 2024 around 4 PM"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Where did it happen?"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                    {/* Dynamic Label based on category */}
                    <div className="form-group">
                        <label className="form-label">
                            {selectedCategory === 'workplace' ? 'Company / Manager Name' :
                                selectedCategory === 'consumer' ? 'Store / Brand Name' :
                                    selectedCategory === 'theft' ? 'Suspect (if any)' : 'Opposing Party Name'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Name of person/entity involved (Optional)"
                            value={formData.opponentName}
                            onChange={(e) => setFormData({ ...formData, opponentName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description of Incident</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Briefly describe what happened. Keep it factual."
                            value={formData.incidentDetails}
                            onChange={(e) => setFormData({ ...formData, incidentDetails: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Evidence (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Screenshots, CCTV footage, Emails, Bills"
                            value={formData.evidence}
                            onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* STEP 3: PREVIEW */}
            {step === 3 && (
                <div className="draft-container">
                    <div className="draft-paper">
                        <div className="paper-content">
                            <p><strong>Date:</strong> {draft.date}</p>
                            <p><strong>To:</strong><br />{draft.authority}</p>
                            <p><strong>From:</strong><br /><span style={{ whiteSpace: 'pre-line' }}>{draft.from}</span></p>

                            <p><strong>Subject:</strong> {draft.subject}</p>

                            <p>Respected Sir/Madam,</p>

                            <p style={{ whiteSpace: 'pre-line' }}>{draft.body}</p>

                        </div>
                    </div>

                    <div className="guidance-sidebar">
                        <div className="guide-card">
                            <div className="guide-title">
                                <Megaphone size={16} /> Where to Submit
                            </div>
                            <ul className="guide-list">
                                {selectedCategory === 'theft' && <li>Nearest Police Station (for Lost Article Report/FIR).</li>}
                                {selectedCategory === 'harassment' && <li>Women's Cell or Local Police Station.</li>}
                                {selectedCategory === 'workplace' && <li>Internal HR Department (Email) OR Labour Court.</li>}
                                {selectedCategory === 'consumer' && <li>Store Manager First &rarr; Then National Consumer Helpline (1915).</li>}
                                {selectedCategory === 'cyber' && <li>National Cyber Crime Portal (cybercrime.gov.in) OR Bank Branch.</li>}
                                {selectedCategory === 'civic' && <li>Municipal Corporation App / Ward Office.</li>}
                                {selectedCategory === 'college' && <li>Proctor / Anti-Ragging Committee / UGC Portal.</li>}
                            </ul>
                        </div>

                        <div className="guide-card">
                            <div className="guide-title">
                                <Briefcase size={16} /> Next Steps
                            </div>
                            <ul className="guide-list">
                                <li><CheckCircle size={14} color="var(--primary)" /> Take 2 printouts of this letter.</li>
                                <li><CheckCircle size={14} color="var(--primary)" /> Submit one copy and ask for a 'Receiving Stamp' on the second copy.</li>
                                <li><CheckCircle size={14} color="var(--primary)" /> Attach copies of proofs (photos, screenshots) - Do not give originals.</li>
                            </ul>
                        </div>

                        <button className="btn btn-primary" onClick={copyToClipboard} style={{ width: '100%' }}>
                            <Copy size={18} /> Copy Text
                        </button>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Actions */}
            <div className="form-actions" style={{ justifyContent: 'center', maxWidth: 600, margin: '2rem auto' }}>
                {step > 1 && (
                    <button className="btn btn-secondary" onClick={handleBack}>
                        <ArrowLeft size={18} /> Back
                    </button>
                )}
                {step < 3 && (
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={step === 1 && !selectedCategory}
                    >
                        Next <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ComplaintDrafter;
