import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await signup(formData.name, formData.email, formData.password);
            navigate('/'); // Redirect to home on success
        } catch (err) {
            console.error("Signup failed:", err);
            // Ensure error is a string to prevent React crash
            const errorMessage = typeof err === 'string'
                ? err
                : err?.message || "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            <div className="header" style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ChevronLeft size={24} color="var(--primary)" />
                </button>
                <h1>Create Account</h1>
            </div>

            <div className="card" style={{ cursor: 'default' }}>
                {error && (
                    <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="label">Full Name</label>
                        <input
                            className="input"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Email Address</label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            placeholder="••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Login
                    </Link>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <p>We only store what is necessary to serve you.</p>
            </div>
        </div>
    );
};

export default Signup;
