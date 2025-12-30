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

        // Check contract-specific risky clauses
        contractKeywords.forEach(item => {
            for (let kw of item.keywords) {
                if (lowerText.includes(kw)) {
                    foundRisks.push({ ...item, trigger: kw });
                    break;
                }
            }
        });

        // ===== OFFICIAL DOCUMENT VALIDATION CHECKS =====

        // 1. Check for Official Seal / Authentication Mark
        const sealKeywords = ['seal', 'stamp', 'authenticated', 'certified', 'official stamp', 'embossed'];
        const hasSealMention = sealKeywords.some(keyword => lowerText.includes(keyword));
        if (!hasSealMention) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Missing seal/stamp mention',
                explanation: '⚠️ Missing or unclear official seal/authentication mark. Official documents typically require visible seals or stamps for authenticity.'
            });
        }

        // 2. Issuer Designation Validation (Notary/Engineer/Architect)
        const issuerDesignations = ['notary', 'engineer', 'architect', 'chartered engineer', 'licensed architect', 'registered engineer'];
        const hasIssuerDesignation = issuerDesignations.some(designation => lowerText.includes(designation));
        const hasIssuerValidation = lowerText.includes('license') || lowerText.includes('registration') || lowerText.includes('certified');

        if (hasIssuerDesignation && !hasIssuerValidation) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Issuer designation unclear',
                explanation: '⚠️ Issuer designation mismatch. The document mentions a professional designation (Notary/Engineer/Architect) but lacks clear validation credentials or license information.'
            });
        }

        // 3. Reference Number Format Consistency
        const referencePatterns = [
            /ref[\s\.:-]*no[\s\.:-]*[a-z0-9\/\-]+/i,
            /reference[\s\.:-]*[a-z0-9\/\-]+/i,
            /reg[\s\.:-]*no[\s\.:-]*[a-z0-9\/\-]+/i,
            /file[\s\.:-]*no[\s\.:-]*[a-z0-9\/\-]+/i
        ];

        const referenceMatches = referencePatterns.filter(pattern => pattern.test(txt));
        if (referenceMatches.length === 0) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No reference number found',
                explanation: '⚠️ Reference number format inconsistency. Official documents should contain a clear reference/registration number for tracking and verification purposes.'
            });
        }

        // 4. Approval Authority Check
        const authorityKeywords = [
            'approved by',
            'sanctioned by',
            'authorized by',
            'ministry',
            'department',
            'municipal corporation',
            'competent authority',
            'issuing authority'
        ];
        const hasApprovalAuthority = authorityKeywords.some(keyword => lowerText.includes(keyword));
        if (!hasApprovalAuthority) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Approval authority not stated',
                explanation: '⚠️ Approval authority not explicitly stated. The document does not clearly mention the issuing or approving authority, which is crucial for verification.'
            });
        }

        // 5. Signature Verification
        const signatureKeywords = ['signature', 'signed by', 'digitally signed', 'countersigned', 'authorized signatory'];
        const hasSignatureMention = signatureKeywords.some(keyword => lowerText.includes(keyword));

        if (!hasSignatureMention) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'No signature verification',
                explanation: '⚠️ Absence of signature verification. The document does not contain clear mention of signatures or authorized signatories, which raises authenticity concerns.'
            });
        }

        // 6. Date and Approval Linkage Validation
        const datePatterns = [
            /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/,  // DD/MM/YYYY or MM/DD/YYYY
            /\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/,    // YYYY/MM/DD
            /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i
        ];

        const dateMatches = datePatterns.filter(pattern => pattern.test(txt));
        const hasIssuedDate = lowerText.includes('issued on') || lowerText.includes('date of issue') || lowerText.includes('dated');
        const hasApprovalDate = lowerText.includes('approved on') || lowerText.includes('date of approval');

        if (dateMatches.length === 0 || (!hasIssuedDate && !hasApprovalDate)) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Date verification issue',
                explanation: '⚠️ Date and approval linkage could not be cross-validated. The document lacks clear date references or the relationship between issue date and approval date is unclear.'
            });
        }

        // 7. Check for Annexures / Supporting Documents
        const annexureKeywords = [
            'annexure',
            'attachment',
            'enclosure',
            'appendix',
            'schedule',
            'see attached',
            'as per annexure'
        ];
        const mentionsAnnexures = annexureKeywords.some(keyword => lowerText.includes(keyword));
        const hasAnnexureList = lowerText.includes('annexure a') || lowerText.includes('attachment 1') || /annexure\s*[a-z0-9]/i.test(lowerText);

        if (mentionsAnnexures && !hasAnnexureList) {
            foundRisks.push({
                risk_level: 'RISKY',
                trigger: 'Missing annexures',
                explanation: '⚠️ Document appears to be conditionally valid and may require additional annexures. References to attachments/annexures found but specific documents not clearly listed.'
            });
        }

        // 8. General Validity Check - If multiple issues found
        if (foundRisks.filter(r => r.risk_level === 'RISKY' && r.trigger.includes('approval')).length >= 3) {
            const criticalIndex = foundRisks.findIndex(r => r.risk_level === 'RISKY');
            if (criticalIndex >= 0) {
                foundRisks[criticalIndex] = {
                    ...foundRisks[criticalIndex],
                    risk_level: 'AVOID',
                    explanation: '🚨 CRITICAL: Multiple validation failures detected. ' + foundRisks[criticalIndex].explanation
                };
            }
        }

        setAnalysis(foundRisks);
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
                                        <strong>⚖️ AI Disclaimer:</strong> This tool performs OCR text extraction and validates documents for authenticity markers (seals, signatures, reference numbers, approval authorities, dates, and annexures). It is not a substitute for legal advice or professional document verification. Always consult qualified professionals for official validation.
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
