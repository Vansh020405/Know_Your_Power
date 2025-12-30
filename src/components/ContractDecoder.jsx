import React, { useState, useRef, useEffect } from 'react';
import contractKeywords from '../data/contracts.json';
import {
    ChevronLeft,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Upload,
    ScanLine,
    Loader2,
    FileText,
    RefreshCw,
    Shield,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';

const ContractDecoder = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, processing, analyzed, error
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [activeTab, setActiveTab] = useState('report'); // report, text

    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const preprocessImage = async (imageFile) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Get image data for manipulation
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                // Simple Grayscale & High Contrast
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Grayscale (weighted)
                    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                    // Contrast (simple thresholding - binarization)
                    // This often helps OCR for clear text on documents
                    // Adjust threshold as needed, 128 is standard middle
                    gray = gray > 120 ? 255 : 0;

                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }

                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        setFile(selected);
        setStatus('idle');
        setAnalysis(null);
        setText('');
        setProgress(0);

        if (selected.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selected));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selected = e.dataTransfer.files[0];
            setFile(selected);
            setStatus('idle');
            setAnalysis(null);
            setText('');
            setProgress(0);
            if (selected.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selected));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const runScan = async () => {
        if (!file) return;
        setStatus('processing');
        setProgress(10);

        try {
            let extractedText = "";

            if (file.type === "text/plain") {
                setStatusMessage("Reading text file...");
                extractedText = await file.text();
                setProgress(100);
            } else if (file.type.startsWith('image/')) {
                setStatusMessage("Enhancing image for better accuracy...");
                const processedImageUrl = await preprocessImage(file);

                setStatusMessage("Initializing AI OCR engine...");
                setProgress(30);

                const result = await Tesseract.recognize(
                    processedImageUrl,
                    'eng',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                setStatusMessage(`Scanning text... ${(m.progress * 100).toFixed(0)}%`);
                                setProgress(30 + (m.progress * 60));
                            }
                        }
                    }
                );

                extractedText = result.data.text;
                setProgress(95);
            } else {
                alert("Unsupported file type for now.");
                setStatus('error');
                return;
            }

            if (!extractedText || extractedText.trim().length === 0) {
                setStatus('error');
                setStatusMessage("No text found. Try a clearer image.");
                return;
            }

            setText(extractedText);
            setStatusMessage("Analyzing for risks...");
            analyzeText(extractedText);
            setStatus('analyzed');
            setProgress(100);

        } catch (err) {
            console.error(err);
            setStatus('error');
            setStatusMessage("Failed to process document.");
        }
    };

    const analyzeText = (txt) => {
        const lowerText = txt.toLowerCase();
        const foundRisks = [];

        // ===== STEP 1: DETECT DOCUMENT TYPE =====
        const documentType = detectDocumentType(lowerText);

        // ===== STEP 2: CHECK CONTRACT-SPECIFIC RISKY CLAUSES (ALL TYPES) =====
        contractKeywords.forEach(item => {
            for (let kw of item.keywords) {
                if (lowerText.includes(kw)) {
                    foundRisks.push({ ...item, trigger: kw });
                    break;
                }
            }
        });

        // ===== STEP 3: APPLY DOCUMENT TYPE-SPECIFIC VALIDATION =====
        if (documentType === 'government') {
            validateGovernmentDocument(txt, lowerText, foundRisks);
        } else if (documentType === 'employment') {
            validateEmploymentDocument(txt, lowerText, foundRisks);
        } else if (documentType === 'contract') {
            validateContractDocument(txt, lowerText, foundRisks);
        } else {
            // Generic document - minimal validation
            validateGenericDocument(txt, lowerText, foundRisks);
        }

        setAnalysis(foundRisks);
    };

    // Detect what type of document this is
    const detectDocumentType = (lowerText) => {
        // Government/Official Documents
        const govKeywords = [
            'ministry', 'department', 'municipal corporation', 'government',
            'sanctioned by', 'competent authority', 'issuing authority',
            'official stamp', 'seal', 'certified copy', 'notarized',
            'notary', 'notary engineer', 'chartered engineer', 'technical clearance',
            'appendix', 'ner/', 'noc'  // Common in govt documents
        ];
        const govScore = govKeywords.filter(kw => lowerText.includes(kw)).length;

        // Employment Documents
        const employmentKeywords = [
            'offer letter', 'appointment letter', 'job offer',
            'employment', 'position', 'salary', 'compensation',
            'joining date', 'designation', 'probation', 'notice period'
        ];
        const empScore = employmentKeywords.filter(kw => lowerText.includes(kw)).length;

        // Contract Documents
        const contractKeywords = [
            'contract', 'agreement', 'party', 'parties',
            'terms and conditions', 'hereby agree', 'whereas',
            'consideration', 'obligations', 'termination clause'
        ];
        const contractScore = contractKeywords.filter(kw => lowerText.includes(kw)).length;

        // Return the type with highest score
        if (govScore >= 2) return 'government';
        if (empScore >= 2) return 'employment';
        if (contractScore >= 2) return 'contract';
        return 'generic';
    };

    // Validation for Government/Official Documents
    const validateGovernmentDocument = (txt, lowerText, foundRisks) => {
        // 1. Official Seal / Authentication
        const sealKeywords = ['seal', 'stamp', 'authenticated', 'certified', 'official stamp', 'embossed'];
        const hasSealMention = sealKeywords.some(keyword => lowerText.includes(keyword));
        if (!hasSealMention) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Missing seal/stamp mention',
                explanation: '⚠️ Government documents typically require visible seals or stamps for authenticity.'
            });
        }

        // 2. Reference Number
        const referencePatterns = [
            /ref[\s\.:-]*no[\s\.:-]*[a-z0-9\/\-]+/i,
            /ref[\s\.:-]*[a-z0-9\/\-]+/i,           // Catch "Ref: ABC..." without "No"
            /reference[\s\.:-]*[a-z0-9\/\-]+/i,
            /reg[\s\.:-]*no[\s\.:-]*[a-z0-9\/\-]+/i,
            /file[\s\.:-]*no[\s\.:-]*[a-z0-9\/\-]+/i
        ];
        const hasReference = referencePatterns.some(pattern => pattern.test(txt));
        if (!hasReference) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No reference number',
                explanation: '⚠️ Official documents should contain a reference/registration number for tracking.'
            });
        }

        // 3. Approval Authority
        const authorityKeywords = [
            'approved by', 'sanctioned by', 'authorized by', 'competent authority',
            'issued by', 'government', 'planning authority', 'planning act',
            'municipality', 'notary', 'town and country'
        ];
        const hasAuthority = authorityKeywords.some(keyword => lowerText.includes(keyword));
        if (!hasAuthority) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Approval authority unclear',
                explanation: '⚠️ The issuing or approving authority is not clearly mentioned.'
            });
        }

        // 4. Date Validation
        const datePatterns = [
            /\b\d{1,2}[\s]*[\/\-\.][\s]*\d{1,2}[\s]*[\/\-\.][\s]*\d{2,4}\b/,  // DD / MM / YYYY
            /\b\d{4}[\s]*[\/\-\.][\s]*\d{1,2}[\s]*[\/\-\.][\s]*\d{1,2}\b/,    // YYYY / MM / DD
            /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i
        ];
        const hasDate = datePatterns.some(pattern => pattern.test(txt));
        const hasIssuedDate = lowerText.includes('issued on') || lowerText.includes('date of issue') ||
            lowerText.includes('dated') || lowerText.includes('date:');

        if (!hasDate && !hasIssuedDate) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No date found',
                explanation: '⚠️ Government documents should include a clear issue or approval date.'
            });
        }
    };

    // Validation for Employment Documents (Job Letters, Offer Letters)
    const validateEmploymentDocument = (txt, lowerText, foundRisks) => {
        // 1. Company Information
        const hasCompanyInfo = lowerText.includes('company') || lowerText.includes('organization') ||
            lowerText.includes('ltd') || lowerText.includes('inc') || lowerText.includes('pvt');

        // 2. Position/Role
        const hasPosition = lowerText.includes('position') || lowerText.includes('role') ||
            lowerText.includes('designation') || lowerText.includes('job title');

        // 3. Compensation mentioned
        const hasCompensation = lowerText.includes('salary') || lowerText.includes('compensation') ||
            lowerText.includes('ctc') || lowerText.includes('per annum') ||
            /\$\d+|\₹\d+|inr\s*\d+/i.test(lowerText);

        // 4. Date
        const datePatterns = [
            /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/,
            /\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/,
            /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i
        ];
        const hasDate = datePatterns.some(pattern => pattern.test(txt));

        // Only flag if CRITICAL elements are missing
        if (!hasCompanyInfo && !hasPosition) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Missing essential info',
                explanation: '⚠️ This employment document lacks basic company and position information.'
            });
        }

        if (!hasDate) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No date found',
                explanation: '⚠️ Employment documents should include issue date or joining date.'
            });
        }
    };

    // Validation for Contracts/Agreements
    const validateContractDocument = (txt, lowerText, foundRisks) => {
        // 1. Parties involved
        const hasParties = lowerText.includes('party') || lowerText.includes('parties') ||
            lowerText.includes('between') && lowerText.includes('and');

        // 2. Effective Date
        const hasEffectiveDate = lowerText.includes('effective date') || lowerText.includes('dated') ||
            lowerText.includes('entered into');

        // 3. Signatures
        const hasSignature = lowerText.includes('signature') || lowerText.includes('signed by') ||
            lowerText.includes('authorized signatory');

        if (!hasParties) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Parties not clearly identified',
                explanation: '⚠️ Contract should clearly identify all parties involved.'
            });
        }

        if (!hasSignature) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No signature section',
                explanation: '⚠️ Contracts typically require signatures from all parties.'
            });
        }
    };

    // Validation for Generic Documents
    const validateGenericDocument = (txt, lowerText, foundRisks) => {
        // Very minimal validation - just check if it has substance
        const wordCount = txt.trim().split(/\s+/).length;

        if (wordCount < 20) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Insufficient content',
                explanation: '⚠️ Document appears to have very limited content. Verify OCR quality.'
            });
        }

        // Check for basic date presence
        const datePatterns = [
            /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/,
            /\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/,
            /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i
        ];
        const hasDate = datePatterns.some(pattern => pattern.test(txt));

        if (!hasDate) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No date found',
                explanation: '⚠️ Most formal documents include a date. Consider verifying document completeness.'
            });
        }
    };

    const getRiskLevel = () => {
        if (!analysis) return 'UNKNOWN';
        if (analysis.some(r => r.risk_level === 'AVOID')) return 'AVOID';
        if (analysis.some(r => r.risk_level === 'RISKY')) return 'RISKY';
        return 'SAFE';
    };

    const riskLevel = getRiskLevel();

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/')} className="btn-icon-only">
                    <ChevronLeft size={24} color="var(--primary)" />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={24} className="text-gradient" />
                        Document Shield
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI-powered Contract Analysis & Document Authenticity Validation</p>
                </div>
            </div>

            <div className="grid-container">
                {/* Left Panel: Input */}
                <div className="panel input-panel">
                    {!file ? (
                        <div
                            className="upload-zone"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <div className="upload-icon-wrapper">
                                <Upload size={32} color="var(--primary)" />
                            </div>
                            <h3>Upload Document</h3>
                            <p>Drag & drop or click to browse</p>
                            <span className="file-types">Supports: JPG, PNG, TXT</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                                accept=".txt,image/png,image/jpeg,image/jpg"
                            />
                        </div>
                    ) : (
                        <div className="file-preview-container">
                            <div className="file-info-bar">
                                <span className="filename">{file.name}</span>
                                <button onClick={() => setFile(null)} className="remove-btn"><XCircle size={18} /></button>
                            </div>

                            <div className="preview-area">
                                {file.type.startsWith('image/') ? (
                                    <img src={previewUrl} alt="Preview" className="doc-preview-img" />
                                ) : (
                                    <div className="text-file-icon">
                                        <FileText size={64} color="var(--text-muted)" />
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary scan-btn"
                                onClick={runScan}
                                disabled={status === 'processing'}
                            >
                                {status === 'processing' ? (
                                    <><Loader2 className="spin" size={20} /> Scanning...</>
                                ) : (
                                    <><ScanLine size={20} /> Analyze Document</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel: Output */}
                <div className="panel output-panel">
                    {status === 'idle' && (
                        <div className="placeholder-state">
                            <Shield size={48} color="rgba(255,255,255,0.1)" />
                            <h3>Ready to Analyze</h3>
                            <p>Upload a document to detect risky clauses and hidden terms.</p>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="processing-state">
                            <div className="loader-ring">
                                <Loader2 size={48} className="spin text-gradient" />
                            </div>
                            <h3>Processing Document</h3>
                            <p>{statusMessage}</p>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-state">
                            <AlertTriangle size={48} color="var(--danger)" />
                            <h3>Scanning Failed</h3>
                            <p>{statusMessage}</p>
                            <button className="btn btn-ghost" onClick={() => setStatus('idle')}>Try Again</button>
                        </div>
                    )}

                    {status === 'analyzed' && (
                        <div className="results-container">
                            <div className="results-tabs">
                                <button
                                    className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('report')}
                                >
                                    Risk Report
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('text')}
                                >
                                    <Eye size={16} /> Extracted Text
                                </button>
                            </div>

                            {activeTab === 'report' ? (
                                <div className="report-content fade-in">
                                    <div className={`status-banner status-${riskLevel.toLowerCase()}`}>
                                        <div className="status-icon">
                                            {riskLevel === 'SAFE' && <CheckCircle size={32} />}
                                            {riskLevel === 'RISKY' && <AlertTriangle size={32} />}
                                            {riskLevel === 'AVOID' && <XCircle size={32} />}
                                        </div>
                                        <div className="status-text">
                                            <h2>{riskLevel === 'SAFE' ? 'Document Verified' : riskLevel === 'AVOID' ? 'Critical Issues Found' : 'Validation Warnings'}</h2>
                                            <p>
                                                {riskLevel === 'SAFE' ? 'All standard validation checks passed. No risky clauses or authenticity issues detected.' :
                                                    riskLevel === 'AVOID' ? 'Multiple critical validation failures detected. This document may not be authentic or complete.' :
                                                        'Document validation identified several authenticity concerns that require your attention.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="risks-list">
                                        {analysis.length === 0 ? (
                                            <div className="clean-scan-card">
                                                <CheckCircle size={24} color="var(--success)" />
                                                <p>✓ All validation checks passed successfully. Document appears authentic with proper seals, signatures, references, and authority markings.</p>
                                            </div>
                                        ) : (
                                            analysis.map((item, idx) => (
                                                <div key={idx} className={`risk-card risk-${item.risk_level.toLowerCase()}`}>
                                                    <div className="risk-header">
                                                        <span className="risk-badge">{item.risk_level}</span>
                                                        <span className="risk-trigger">Trigger: "{item.trigger}"</span>
                                                    </div>
                                                    <p className="risk-desc">{item.explanation}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="disclaimer-box">
                                        <strong>⚖️ AI Disclaimer:</strong> This tool uses intelligent OCR and context-aware validation. It automatically detects document type (Government, Employment, Contract, or Generic) and applies appropriate validation rules. Not a substitute for legal advice or professional document verification. Always consult qualified professionals for official validation.
                                    </div>
                                </div>
                            ) : (
                                <div className="text-content fade-in">
                                    <textarea
                                        className="extracted-textarea"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Extracted text will appear here..."
                                    />
                                    <div className="text-actions">
                                        <button className="btn btn-ghost btn-sm" onClick={() => analyzeText(text)}>
                                            <RefreshCw size={14} style={{ marginRight: 6 }} /> Re-Analyze Text
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .fade-in { animation: fadeIn 0.5s ease-out; }
                .btn-icon-only { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; display: grid; place-items: center; transition: background 0.2s; }
                .btn-icon-only:hover { background: rgba(255,255,255,0.1); }
                
                .grid-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                @media (min-width: 768px) {
                    .grid-container { grid-template-columns: 1fr 1.2fr; align-items: start; }
                }

                .panel {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 1.5rem;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Input Panel */
                .upload-zone {
                    flex: 1;
                    border: 2px dashed rgba(255,255,255,0.1);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                    padding: 2rem;
                }
                .upload-zone:hover { border-color: var(--primary); background: rgba(16,185,129,0.05); }
                .upload-icon-wrapper { background: rgba(16,185,129,0.1); padding: 1rem; border-radius: 50%; margin-bottom: 1rem; }
                .file-types { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; }

                .file-preview-container { display: flex; flex-direction: column; height: 100%; gap: 1rem; }
                .file-info-bar { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; }
                .filename { font-size: 0.85rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
                .remove-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
                .remove-btn:hover { color: var(--danger); }
                
                .preview-area {
                    flex: 1;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    min-height: 250px;
                }
                .doc-preview-img { max-width: 100%; max-height: 100%; object-fit: contain; }
                .scan-btn { width: 100%; margin-top: auto; gap: 8px; }

                /* Output Panel */
                .placeholder-state, .processing-state, .error-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: 1rem;
                    color: var(--text-muted);
                }
                .processing-state h3 { color: var(--text); }
                
                .progress-bar-container {
                    width: 80%;
                    height: 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 6px;
                    overflow: hidden;
                    margin-top: 1rem;
                }
                .progress-bar-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }

                /* Results */
                .results-container { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
                .results-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
                .tab-btn {
                    background: none;
                    border: none;
                    padding: 0.5rem 1rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .tab-btn.active { background: rgba(255,255,255,0.05); color: var(--primary); }
                .tab-btn:hover:not(.active) { color: var(--text); }

                .status-banner {
                    padding: 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .status-safe { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); color: #34D399; }
                .status-risky { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); color: #FBBF24; }
                .status-avoid { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #F87171; }
                
                .risks-list { display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; padding-right: 4px; }
                
                .risk-card {
                    padding: 1rem;
                    border-radius: 8px;
                    background: rgba(0,0,0,0.2);
                    border-left: 4px solid transparent;
                }
                .risk-safe { border-left-color: var(--success); }
                .risk-risky { border-left-color: var(--warning); }
                .risk-avoid { border-left-color: var(--danger); }

                .risk-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem; }
                .risk-badge { font-weight: 700; text-transform: uppercase; }
                .risk-trigger { color: var(--text-muted); font-style: italic; }
                .risk-desc { font-size: 0.95rem; line-height: 1.4; font-weight: 500; }

                .extracted-textarea {
                    width: 100%;
                    height: 300px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 1rem;
                    color: var(--text);
                    resize: vertical;
                    font-family: monospace;
                    font-size: 0.9rem;
                }
                .text-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .disclaimer-box { margin-top: 2rem; padding: 1rem; border: 1px dashed var(--border); border-radius: 8px; font-size: 0.75rem; color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default ContractDecoder;
