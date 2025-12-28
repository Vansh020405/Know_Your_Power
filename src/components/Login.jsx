import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/'); // Redirect to home on success
        } catch (err) {
            setError(err);
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
                <h1>Welcome Back</h1>
            </div>

            <div className="card" style={{ cursor: 'default' }}>
                {error && (
                    <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Placeholder for now */}
                    <div style={{ textAlign: 'center' }}>
                        <button type="button" className="btn btn-ghost" style={{ border: 'none', padding: 0, fontSize: '0.85rem' }}>Forgot password?</button>
                    </div>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>New here? </span>
                    <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                        Create a free account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
