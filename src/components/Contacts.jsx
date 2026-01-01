import React, { useState, useEffect } from 'react';
import contactsData from '../data/contacts.json';
import {
    Phone,
    Plus,
    Search,
    Info,
    ChevronLeft,
    X,
    Trash2,
    Shield,
    AlertTriangle,
    Building,
    User
} from 'lucide-react';
import '../styles/Contacts.css';

const Contacts = () => {
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
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
        if (window.confirm('Delete this contact?')) {
            saveContacts(userContacts.filter(c => c.id !== id));
        }
    };

    // Combine & Filter
    const allContacts = [...userContacts, ...contactsData.contacts];
    const filteredContacts = allContacts.filter(contact => {
        const matchesCategory = filterCategory === 'All' || contact.category === filterCategory;
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.description && contact.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Helper for Avatar Initials or Icon
    const getAvatar = (contact) => {
        if (contact.category === 'Emergency') return <div className="ios-avatar emergency"><AlertTriangle size={20} /></div>;
        if (contact.category === 'Legal Help') return <div className="ios-avatar legal"><Shield size={20} /></div>;
        if (contact.category === 'Government') return <div className="ios-avatar gov"><Building size={20} /></div>;

        // Default / Personal: Initials
        const initials = contact.name.slice(0, 2).toUpperCase();
        return <div className="ios-avatar personal">{initials}</div>;
    };

    return (
        <div className="ios-contacts-page">

            {/* iOS Header */}
            <div className="ios-header">
                <div className="ios-top-bar">
                    <button className="ios-edit-btn" onClick={() => setShowAddModal(true)}>Add</button>
                    {/* Segmented Control could go here if we want strictly "Recents" look, but title fits better */}
                </div>
                <h1 className="ios-title">Detailed Contacts</h1>

                {/* Search Bar */}
                <div className="ios-search-container">
                    <div className="ios-search-bar">
                        <Search size={16} className="ios-search-icon" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')}><div className="ios-clear-icon"><X size={10} /></div></button>}
                    </div>
                </div>

                {/* Filter Tabs (Styled like Segmented Control) */}
                <div className="ios-segmented-control">
                    {['All', 'Emergency', 'Legal', 'Personal'].map(cat => (
                        <button
                            key={cat}
                            className={`segment-btn ${filterCategory === (cat === 'Legal' ? 'Legal Help' : cat) ? 'active' : ''}`}
                            onClick={() => setFilterCategory(cat === 'Legal' ? 'Legal Help' : cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contacts List */}
            <div className="ios-list">
                {filteredContacts.map(contact => (
                    <div key={contact.id} className="ios-list-item">
                        <div className="ios-item-left">
                            {/* Call Button (Invisible overlay or left click) */}
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="ios-click-target" title={`Call ${contact.name}`}></a>
                            )}

                            {/* Avatar */}
                            {getAvatar(contact)}

                            <div className="ios-text-content">
                                <h3 className={contact.category === 'Emergency' ? 'text-danger' : ''}>{contact.name}</h3>
                                <p>
                                    <span className="ios-label">{contact.category}</span>
                                    {contact.phone && <span className="ios-phone-preview"> • {contact.phone}</span>}
                                </p>
                            </div>
                        </div>

                        <div className="ios-item-right">
                            <span className="ios-time">24/7</span>
                            <button className="ios-info-btn">
                                <Info size={22} />
                            </button>
                            {contact.isUserAdded && (
                                <button className="ios-delete-action" onClick={() => handleDeleteContact(contact.id)}>
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredContacts.length === 0 && (
                    <div className="ios-no-results">
                        <p>No contacts found</p>
                    </div>
                )}
            </div>

            {/* Add Contact Modal (iOS Sheet Style) */}
            {showAddModal && (
                <div className="ios-modal-overlay">
                    <div className="ios-modal">
                        <div className="ios-modal-header">
                            <button onClick={() => setShowAddModal(false)}>Cancel</button>
                            <h3>New Contact</h3>
                            <button className="bold-btn" onClick={handleAddContact} disabled={!newContact.name || !newContact.phone}>Done</button>
                        </div>
                        <div className="ios-form">
                            <div className="ios-input-group">
                                <input
                                    placeholder="Name"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                />
                                <div className="divider"></div>
                                <input
                                    placeholder="Phone"
                                    type="tel"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                />
                                <div className="divider"></div>
                                <select
                                    value={newContact.category}
                                    onChange={e => setNewContact({ ...newContact, category: e.target.value })}
                                >
                                    <option value="Personal">Personal</option>
                                    <option value="Legal Help">Legal Help</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
