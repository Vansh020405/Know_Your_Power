import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
    // State / Jurisdiction
    const [region, setRegion] = useState(() => {
        return localStorage.getItem('user_region') || 'India (General)';
    });

    useEffect(() => {
        localStorage.setItem('user_region', region);
    }, [region]);

    // History
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('user_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load history', e);
            return [];
        }
    });

    const addToHistory = (item) => {
        setHistory(prev => {
            // Avoid duplicates at the top
            const filtered = prev.filter(i => i.id !== item.id);
            const newItem = {
                ...item,
                timestamp: new Date().toISOString()
            };
            // Keep last 20 items
            const newHistory = [newItem, ...filtered].slice(0, 20);
            localStorage.setItem('user_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('user_history');
    };

    return (
        <PreferencesContext.Provider value={{
            region,
            setRegion,
            history,
            addToHistory,
            clearHistory
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};
