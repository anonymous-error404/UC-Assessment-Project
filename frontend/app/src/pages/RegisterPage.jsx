import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './LoginPage.css';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authAPI.register({ name: name.trim(), email: email.trim(), password, role });
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">IT</div>
                    <h1 className="login-title">Create Account</h1>
                    <p className="login-subtitle">Register for your Issue Tracker account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-name">Full Name *</label>
                        <input
                            id="reg-name"
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email Address *</label>
                        <input
                            id="reg-email"
                            type="email"
                            className="form-input"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-role">Role *</label>
                        <select
                            id="reg-role"
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ background: 'var(--color-surface-2)' }}
                        >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password *</label>
                        <input
                            id="reg-password"
                            type="password"
                            className="form-input"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                        <input
                            id="reg-confirm"
                            type="password"
                            className="form-input"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <div className="alert alert-error login-error">{error}</div>}
                    {success && <div className="alert alert-success login-error">{success}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary login-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
