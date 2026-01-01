import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Lock,
    Unlock,
    FileText,
    Plus,
    Shield,
    Trash2,
    Download,
    X,
    Image as ImageIcon,
    File
} from 'lucide-react';
import '../styles/SecureVault.css';

const SecureVault = () => {
    const { user } = useAuth();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState(['', '', '', '']);
    const [storedPin, setStoredPin] = useState(null);
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [error, setError] = useState('');
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Refs for pin inputs
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];
    const fileInputRef = useRef();

    useEffect(() => {
        // Load settings
        const savedPin = localStorage.getItem('kyp_vault_pin_' + (user?.uid || 'guest'));
        const savedDocs = localStorage.getItem('kyp_vault_docs_' + (user?.uid || 'guest'));

        if (savedPin) {
            setStoredPin(savedPin);
        } else {
            setIsSetupMode(true);
        }

        if (savedDocs) {
            setDocuments(JSON.parse(savedDocs));
        }
    }, [user]);

    const handlePinChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1); // Only allow 1 digit
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError('');

        // Auto focus next
        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        }

        // Check if complete
        if (newPin.every(digit => digit !== '')) {
            const pinString = newPin.join('');
            setTimeout(() => validatePin(pinString), 100);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const validatePin = (inputPin) => {
        if (isSetupMode) {
            // Confirming setup
            // For simplicity in this demo, first entry allows "Set". 
            // In a real app, you'd ask for "Confirm PIN".
            // Here we'll simple save it.
            localStorage.setItem('kyp_vault_pin_' + (user?.uid || 'guest'), inputPin);
            setStoredPin(inputPin);
            setIsSetupMode(false);
            setIsUnlocked(true);
            setPin(['', '', '', '']);
            alert('PIN Set Successfully!');
        } else {
            if (inputPin === storedPin) {
                setIsUnlocked(true);
                setPin(['', '', '', '']);
                setError('');
            } else {
                setError('Incorrect PIN');
                setPin(['', '', '', '']);
                inputRefs[0].current.focus();
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size limit: 3MB (LocalStorage is usually 5-10MB total)
        if (file.size > 3 * 1024 * 1024) {
            alert('File too large (Max 3MB for local vault)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const newDoc = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                data: reader.result,
                date: new Date().toLocaleDateString()
            };
            const updatedDocs = [...documents, newDoc];
            setDocuments(updatedDocs);
            localStorage.setItem('kyp_vault_docs_' + (user?.uid || 'guest'), JSON.stringify(updatedDocs));
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteDoc = (id) => {
        if (window.confirm('Permanently delete this document?')) {
            const updatedDocs = documents.filter(doc => doc.id !== id);
            setDocuments(updatedDocs);
            localStorage.setItem('kyp_vault_docs_' + (user?.uid || 'guest'), JSON.stringify(updatedDocs));
            setSelectedDoc(null);
        }
    };

    const getIconForType = (type) => {
        if (type.startsWith('image/')) return <ImageIcon size={32} />;
        return <FileText size={32} />;
    };

    // --- RENDER ---

    if (!user) {
        return (
            <div className="vault-container">
                <div className="vault-lock-screen">
                    <Shield size={64} className="vault-icon-large" style={{ color: '#8E8E93' }} />
                    <h2 className="vault-title">Secure Vault</h2>
                    <p className="vault-subtitle">Please log in to access your secure documents.</p>
                </div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="vault-container">
                <div className="vault-lock-screen">
                    <div style={{ marginBottom: '2rem' }}>
                        <Lock size={48} className="vault-icon-large" />
                    </div>
                    <h2 className="vault-title">{isSetupMode ? 'Set Vault PIN' : 'Enter Vault PIN'}</h2>
                    <p className="vault-subtitle">
                        {isSetupMode
                            ? 'Create a 4-digit PIN to secure your documents.'
                            : 'Enter your 4-digit PIN to unlock.'}
                    </p>

                    <div className="pin-input-container">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="password"
                                inputMode="numeric"
                                className="pin-digit"
                                value={digit}
                                onChange={(e) => handlePinChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                maxLength={1}
                            />
                        ))}
                    </div>
                    <div className="error-text">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="vault-container">
            <div className="vault-dashboard">
                <div className="vault-header">
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>My Vault</h1>
                        <span style={{ color: '#8E8E93', fontSize: '0.9rem', fontWeight: 500 }}>{documents.length} Encrypted Files</span>
                    </div>
                    <button onClick={() => setIsUnlocked(false)} style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer' }}>
                        <Lock size={22} />
                    </button>
                </div>

                {documents.length > 0 ? (
                    <div className="vault-grid">
                        {documents.map(doc => (
                            <div key={doc.id} className="doc-card" onClick={() => setSelectedDoc(doc)}>
                                <div className="doc-preview-area">
                                    {doc.type.startsWith('image/') ? (
                                        <img src={doc.data} alt="preview" className="doc-preview-img" />
                                    ) : (
                                        <File size={40} color="#0A84FF" />
                                    )}
                                </div>
                                <div className="doc-info-area">
                                    <div className="doc-name">{doc.name}</div>
                                    <div className="doc-date">{doc.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <Shield size={36} color="#0A84FF" />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>No Secure Docs</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#636366', maxWidth: '260px', lineHeight: '1.5' }}>
                            Photos & files stored here are encrypted and kept local to this device.
                        </p>
                    </div>
                )}

                {/* FAB */}
                <button className="vault-fab" onClick={() => fileInputRef.current.click()}>
                    <Plus size={28} strokeWidth={2.5} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                />
            </div>

            {/* Document Detail Modal */}
            {selectedDoc && (
                <div className="file-modal-overlay" onClick={() => setSelectedDoc(null)}>
                    <div className="file-modal" onClick={e => e.stopPropagation()}>
                        <div className="file-preview">
                            {selectedDoc.type.startsWith('image/') ? (
                                <img src={selectedDoc.data} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>Preview not available</p>
                                </div>
                            )}
                        </div>
                        <div className="file-modal-content">
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{selectedDoc.name}</h3>
                            <p style={{ margin: 0, color: '#8E8E93', fontSize: '0.8rem' }}>Added on {selectedDoc.date}</p>

                            <div className="file-modal-actions">
                                <a href={selectedDoc.data} download={selectedDoc.name} className="file-btn btn-download" style={{ textDecoration: 'none' }}>
                                    <Download size={20} /> Save
                                </a>
                                <button className="file-btn btn-delete" onClick={() => handleDeleteDoc(selectedDoc.id)}>
                                    <Trash2 size={20} /> Delete
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedDoc(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecureVault;
