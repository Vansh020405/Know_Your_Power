import React, { useState } from 'react';
import contractKeywords from '../data/contracts.json';
import { ChevronLeft, AlertTriangle, CheckCircle, XCircle, Upload, ScanLine, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';

const ContractDecoder = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset states
        setAnalysis(null);
        setProcessStatus('Reading file...');
        setIsProcessing(true);

        // 1. TEXT FILES
        if (file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                if (content.length > 50) {
                    setText(content);
                    setIsProcessing(false);
                    setProcessStatus('');
                } else {
                    // Too short? Maybe try OCR if it was an image, but this is simple text.
                    // Just set it.
                    setText(content);
                    setIsProcessing(false);
                }
            };
            reader.readAsText(file);
        }
        // 2. IMAGE FILES (Trigger OCR)
        else if (file.type.startsWith('image/')) {
            setProcessStatus('Scanning document (AI-OCR)... This may take a moment.');

            Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProcessStatus(`Scanning... ${(m.progress * 100).toFixed(0)}%`);
                        }
                    }
                }
            ).then(({ data: { text: extractedText } }) => {
                if (!extractedText || extractedText.trim().length === 0) {
                    alert('Could not read any text from this image. Please ensure it is clear.');
                } else {
                    setText(extractedText);
                }
                setIsProcessing(false);
                setProcessStatus('');
            }).catch(err => {
                console.error(err);
                alert('Failed to scan document. Please try a clearer image.');
                setIsProcessing(false);
            });
        }
        else {
            alert("Please upload .txt images (.png, .jpg) only. PDF support is limited to text extraction tools currently.");
            setIsProcessing(false);
        }
    };

    const analyzeText = () => {
        if (!text.trim()) return;

        const lowerText = text.toLowerCase();
        const foundRisks = [];

        contractKeywords.forEach(item => {
            for (let kw of item.keywords) {
                if (lowerText.includes(kw)) {
                    foundRisks.push(item);
                    break;
                }
            }
        });

        setAnalysis(foundRisks);
    };

    if (analysis) {
        const riskCount = analysis.filter(r => r.risk_level === 'RISKY').length;
        const avoidCount = analysis.filter(r => r.risk_level === 'AVOID').length;

        let status = 'SAFE';
        if (riskCount > 0) status = 'RISKY';
        if (avoidCount > 0) status = 'AVOID';

        return (
            <div>
                <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => setAnalysis(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ChevronLeft size={24} color="var(--primary)" />
                    </button>
                    <h1>Analysis Result</h1>
                </div>

                <div className="result-box" style={{
                    backgroundColor: status === 'SAFE' ? '#ECFDF5' : (status === 'AVOID' ? '#FEF2F2' : '#FFFBEB'),
                    color: status === 'SAFE' ? '#065F46' : (status === 'AVOID' ? '#991B1B' : '#92400E'),
                    borderColor: status === 'SAFE' ? '#A7F3D0' : (status === 'AVOID' ? '#FECACA' : '#FDE68A')
                }}>
                    <h2 style={{ fontSize: '2rem' }}>{status}</h2>
                    <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>
                        {status === 'SAFE' ? 'No major red flags detected.' :
                            status === 'AVOID' ? 'Critical issues found. Be very careful.' :
                                'Use caution. Several risky clauses found.'}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    {analysis.map((item, idx) => (
                        <div key={idx} className="card" style={{ cursor: 'default', borderLeft: `4px solid ${item.risk_level === 'SAFE' ? 'var(--success)' : item.risk_level === 'AVOID' ? 'var(--danger)' : 'var(--warning)'}` }}>
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {item.risk_level === 'AVOID' && <XCircle size={20} color="var(--danger)" />}
                                {item.risk_level === 'RISKY' && <AlertTriangle size={20} color="var(--warning)" />}
                                {item.risk_level === 'SAFE' && <CheckCircle size={20} color="var(--success)" />}
                                {item.risk_level}
                            </div>
                            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>
                                Issue: {item.explanation}
                            </p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                Trigger word: "{item.keywords.find(k => text.toLowerCase().includes(k))}"
                            </div>
                        </div>
                    ))}
                    {analysis.length === 0 && (
                        <div className="card" style={{ cursor: 'default' }}>
                            <div className="card-title"><CheckCircle size={20} color="var(--success)" style={{ marginRight: 8 }} />Clean Scan</div>
                            <p className="card-desc">We didn't detect standard risky keywords in the text provided. This doesn't mean it's perfect, but it's a good sign.</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <strong>DISCLAIMER:</strong> This tool detects common keywords but does not replace a lawyer. It may miss context-specific risks. Use at your own discretion.
                </div>

                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setAnalysis(null)}>
                    Analyze Another
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} color="var(--primary)" />
                </button>
                <h1>Decode Contract</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p className="card-desc">Paste your offer letter, rental agreement, or contract text here to detect risky clauses, or upload a clear photo/screenshot.</p>

                <div style={{ position: 'relative' }}>
                    <textarea
                        className="textarea"
                        rows={10}
                        placeholder="Paste text or upload image..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isProcessing}
                        style={{ opacity: isProcessing ? 0.6 : 1 }}
                    />

                    {isProcessing && (
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', backdropFilter: 'blur(2px)'
                        }}>
                            <Loader2 size={32} className="chat-bubble" style={{ animation: 'spin 1s linear infinite', background: 'none', boxShadow: 'none', color: 'var(--primary)', marginBottom: 0 }} />
                            <span style={{ fontSize: '0.9rem', color: '#fff', marginTop: '1rem', fontWeight: 600 }}>{processStatus}</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <label className={`btn btn-ghost ${isProcessing ? 'disabled' : ''}`} style={{ border: '1px solid var(--border)', flex: 1, cursor: 'pointer', opacity: isProcessing ? 0.5 : 1 }}>
                        <ScanLine size={20} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                        <input
                            type="file"
                            accept=".txt,image/png,image/jpeg,image/jpg"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            disabled={isProcessing}
                        />
                        Scan Image
                    </label>
                    <button className="btn btn-primary" onClick={analyzeText} disabled={!text.trim() || isProcessing} style={{ flex: 2 }}>
                        Find Risks
                    </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                    Privacy Note: All processing happens on your device.
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ContractDecoder;
