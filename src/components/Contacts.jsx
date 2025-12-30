import React, { useState, useEffect } from 'react';
import contactsData from '../data/contacts.json';
import {
    Phone,
    ExternalLink,
    Shield,
    AlertTriangle,
    Building,
    Search,
    X,
    Plus,
    Trash2,
    User,
    Copy,
    Share2,
    CheckCircle,
    Info
} from 'lucide-react';
import '../styles/Contacts.css';

const Contacts = () => {
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [copyStatus, setCopyStatus] = useState(null);

    // User Added Contacts State
    const [userContacts, setUserContacts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', category: 'Personal', description: '' });

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('kyp_user_contacts');
        if (saved) {
            setUserContacts(JSON.parse(saved));
        }
    }, []);

    // Save to LocalStorage
    const saveContacts = (contacts) => {
        setUserContacts(contacts);
        localStorage.setItem('kyp_user_contacts', JSON.stringify(contacts));
    };

    const handleAddContact = () => {
        if (!newContact.name || !newContact.phone) return;

        const contact = {
            id: 'user_' + Date.now(),
            ...newContact,
            isUserAdded: true
        };

        saveContacts([...userContacts, contact]);
        setShowAddModal(false);
        setNewContact({ name: '', phone: '', category: 'Personal', description: '' });
    };

    const handleDeleteContact = (id) => {
        saveContacts(userContacts.filter(c => c.id !== id));
    };

    const handleCopy = (phone) => {
        navigator.clipboard.writeText(phone);
        setCopyStatus(phone);
        setTimeout(() => setCopyStatus(null), 2000);
    };

    const categories = ['All', 'Emergency', 'Legal Help', 'Government', 'Personal'];

    const getIcon = (cat) => {
        switch (cat) {
            case 'Emergency': return <AlertTriangle size={18} />;
            case 'Legal Help': return <Shield size={18} />;
            case 'Government': return <Building size={18} />;
            case 'Personal': return <User size={18} />;
            default: return <Phone size={18} />;
        }
    };

    const getCatClass = (cat) => {
        switch (cat) {
            case 'Emergency': return 'cat-emergency';
            case 'Legal Help': return 'cat-legal';
            case 'Government': return 'cat-gov';
            case 'Personal': return 'cat-personal';
            default: return '';
        }
    };

    // Combine Official + User Contacts
    const allContacts = [...userContacts, ...contactsData.contacts];

    const filteredContacts = allContacts.filter(contact => {
        const matchesCategory = filterCategory === 'All' || contact.category === filterCategory;
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.description && contact.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="contacts-page">
            {/* Hero Section */}
            <div className="contacts-hero">
                <div className="hero-badge-contacts">
                    <Phone size={14} /> <span>Help Directory</span>
                </div>
                <h1>Important <span className="text-gradient">Contacts</span></h1>
                <p>A verified directory of emergency services, legal aid, and your personal trusted contacts.</p>

                {/* SEARCH */}
                <div className="contacts-search-container">
                    <div className="search-input-wrapper">
                        <Search size={20} className="search-icon-contacts" />
                        <input
                            type="text"
                            placeholder="Find help, legal aid, or emergency services..."
                            className="contacts-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <X
                                size={20}
                                className="clear-search-contacts"
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="contacts-categories">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`cat-tab ${filterCategory === cat ? 'active' : ''}`}
                        onClick={() => setFilterCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* CONTACT CARDS */}
            <div className="contacts-grid">
                {filteredContacts.map(contact => (
                    <div
                        key={contact.id}
                        className={`contact-card ${contact.isUserAdded ? 'user-added-card' : ''}`}
                    >
                        <div className="contact-card-top">
                            <div className={`contact-cat-badge ${getCatClass(contact.category)}`}>
                                {getIcon(contact.category)} {contact.category}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="delete-contact-btn"
                                    onClick={() => handleCopy(contact.phone)}
                                    title="Copy Number"
                                >
                                    {copyStatus === contact.phone ? <CheckCircle size={18} color="var(--primary)" /> : <Copy size={18} />}
                                </button>
                                {contact.isUserAdded && (
                                    <button
                                        onClick={() => handleDeleteContact(contact.id)}
                                        className="delete-contact-btn"
                                        title="Delete Contact"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="contact-info">
                            <h3>{contact.name}</h3>
                            <p className="contact-desc">{contact.description}</p>
                        </div>

                        <div className="contact-actions">
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="call-btn">
                                    <Phone size={20} /> Call {contact.phone}
                                </a>
                            )}
                            {contact.website && (
                                <a href={contact.website} target="_blank" rel="noreferrer" className="web-btn">
                                    <ExternalLink size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {filteredContacts.length === 0 && (
                    <div className="no-results-contacts">
                        <Search size={48} />
                        <p>No contacts found for "{searchTerm}" in {filterCategory}</p>
                    </div>
                )}
            </div>

            {/* FLOATING ADD BUTTON */}
            <button className="floating-add-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={32} />
            </button>

            {/* ADD CONTACT MODAL */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Contact</h3>
                            <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Name or Identity</label>
                            <input
                                className="form-input"
                                value={newContact.name}
                                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                placeholder="e.g. My Lawyer, Family Member"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                className="form-input"
                                value={newContact.phone}
                                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                placeholder="+91..."
                                type="tel"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description / Note</label>
                            <input
                                className="form-input"
                                value={newContact.description}
                                onChange={e => setNewContact({ ...newContact, description: e.target.value })}
                                placeholder="Optional reminder or title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="form-input"
                                value={newContact.category}
                                onChange={e => setNewContact({ ...newContact, category: e.target.value })}
                            >
                                <option value="Personal">Personal</option>
                                <option value="Legal Help">Legal Help</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddContact}
                                disabled={!newContact.name || !newContact.phone}
                            >
                                Save Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
