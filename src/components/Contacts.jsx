import React, { useState, useEffect } from 'react';
import contactsData from '../data/contacts.json';
import { Phone, ExternalLink, Shield, AlertTriangle, Building, Search, X, Plus, Trash2, User } from 'lucide-react';

const Contacts = () => {
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // User Added Contacts State
    const [userContacts, setUserContacts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', category: 'Personal', description: 'Personal Contact' });

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
        setNewContact({ name: '', phone: '', category: 'Personal', description: 'Personal Contact' });
    };

    const handleDeleteContact = (id) => {
        if (window.confirm('Delete this contact?')) {
            saveContacts(userContacts.filter(c => c.id !== id));
        }
    };

    const categories = ['All', 'Emergency', 'Legal Help', 'Government', 'Personal'];

    const getIcon = (cat) => {
        switch (cat) {
            case 'Emergency': return <AlertTriangle size={20} />;
            case 'Legal Help': return <Shield size={20} />;
            case 'Government': return <Building size={20} />;
            case 'Personal': return <User size={20} />;
            default: return <Phone size={20} />;
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
        <div style={{ paddingBottom: '5rem' }}>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Important Contacts</h1>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Verified help directory</span>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-icon"
                    style={{ background: 'var(--primary)', color: 'black', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* SEARCH */}
            <div style={{ padding: '0 1rem', marginBottom: '1rem', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search for help..."
                    className="input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                />
                {searchTerm && (
                    <X
                        size={18}
                        style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}
                        onClick={() => setSearchTerm('')}
                    />
                )}
            </div>

            {/* CATEGORY TABS */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0 1rem',
                marginBottom: '1.5rem',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: '1px solid',
                            borderColor: filterCategory === cat ? 'var(--primary)' : '#333',
                            background: filterCategory === cat ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: filterCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* CONTACT CARDS */}
            <div style={{ padding: '0 1rem', display: 'grid', gap: '1rem' }}>
                {filteredContacts.map(contact => (
                    <div key={contact.id} className="card" style={{ padding: '1.25rem', borderColor: contact.isUserAdded ? 'var(--primary)' : 'transparent' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    color: contact.category === 'Emergency' ? 'var(--danger)' : 'var(--primary)',
                                    marginBottom: '0.25rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    {getIcon(contact.category)} {contact.category} {contact.isUserAdded && <span style={{ fontSize: '0.6rem', background: '#333', padding: '2px 4px', borderRadius: '4px', color: '#ccc' }}>PERSONAL</span>}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{contact.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{contact.description}</p>
                            </div>
                            {contact.isUserAdded && (
                                <button
                                    onClick={() => handleDeleteContact(contact.id)}
                                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            {contact.phone && (
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="btn btn-primary"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textDecoration: 'none',
                                        padding: '0.6rem',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <Phone size={18} /> Call {contact.phone}
                                </a>
                            )}

                            {contact.website && (
                                <a
                                    href={contact.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '40px', // Icon button
                                        textDecoration: 'none',
                                        padding: '0'
                                    }}
                                >
                                    <ExternalLink size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {filteredContacts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No contacts found for this category.
                    </div>
                )}
            </div>

            {/* DISCLAIMER */}
            <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>
                    Information provided for general assistance only.<br />
                    Availability depends on the service provider.
                </p>
            </div>

            {/* ADD CONTACT MODAL */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', background: '#1a1a1a', border: '1px solid #333' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Add Personal Contact</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem' }}>Name</label>
                                <input
                                    className="input"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    placeholder="e.g. My Lawyer, Dad"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem' }}>Phone Number</label>
                                <input
                                    className="input"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                    placeholder="+91..."
                                    type="tel"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem' }}>Position / Role</label>
                                <input
                                    className="input"
                                    value={newContact.description}
                                    onChange={e => setNewContact({ ...newContact, description: e.target.value })}
                                    placeholder="e.g. Senior Lawyer, Local Police"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem' }}>Category</label>
                                <select
                                    className="input"
                                    value={newContact.category}
                                    onChange={e => setNewContact({ ...newContact, category: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="Personal">Personal</option>
                                    <option value="Legal Help">Legal Help</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                className="btn"
                                onClick={() => setShowAddModal(false)}
                                style={{ flex: 1, background: '#333' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddContact}
                                disabled={!newContact.name || !newContact.phone}
                                style={{ flex: 1, opacity: (!newContact.name || !newContact.phone) ? 0.5 : 1 }}
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
