import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL as BASE_API_URL } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use centralized API URL (auto-switches between dev and production)
    const API_URL = `${BASE_API_URL}/auth`;

    // Helper to load user given a token
    const loadUser = async (token) => {
        try {
            const res = await fetch(`${API_URL}/user`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return data.user;
            } else {
                throw data.msg || "Login failed";
            }
        } catch (error) {
            console.error("AuthContext Login Error:", error);
            throw typeof error === 'string' ? error : error.message || "Network error. Please check your connection.";
        }
    };

    const signup = async (name, email, password) => {
        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return data.user;
            } else {
                throw data.msg || "Signup failed";
            }
        } catch (error) {
            console.error("AuthContext Signup Error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
