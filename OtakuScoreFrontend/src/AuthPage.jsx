import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { API_BASE_URL } from './config.js';

function AuthPage() {
    const { mode } = useParams();
    const isRegister = mode === 'register';

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [awaitingVerification, setAwaitingVerification] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [verified, setVerified] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (isRegister) {
                await register(username, email, password);
                setAwaitingVerification(true);
            } else {
                await login(username, password);
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    const handleResend = async () => {
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to resend code.');
            }

            setError('A new code has been sent to your email.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, code }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Verification failed.');
            }

            setVerified(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    if (verified) {
        return (
            <div className="detail-page">
                <div className="auth-card">
                    <h1>Email Verified!</h1>
                    <p className="status-message success" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Your account is ready to go.
                    </p>
                    <button
                        className="submit-button"
                        style={{ width: '100%' }}
                        onClick={() => {
                            setVerified(false);
                            setAwaitingVerification(false);
                            navigate('/auth/login');
                        }}
                    >
                        Continue to Log In
                    </button>
                </div>
            </div>
        );
    }

    if (awaitingVerification) {
        return (
            <div className="detail-page">
                <div className="auth-card">
                    <h1>Verify Your Email</h1>
                    <p className="status-message" style={{ textAlign: 'center', marginBottom: '16px' }}>
                        We sent a 6-digit code to {email}. Enter it below to finish creating your account.
                        If you don't see it within a minute, check your spam or junk folder.
                    </p>

                    <form className="auth-form" onSubmit={handleVerify}>
                        <div className="form-row-review">
                            <label htmlFor="code">Verification Code</label>
                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="search-input"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-button" disabled={submitting}>
                            {submitting ? 'Verifying...' : 'Verify Email'}
                        </button>

                        {error && <p className="status-message error">{error}</p>}
                    </form>
                    <button
                        className="watchlist-button"
                        style={{ marginTop: '12px', width: '100%' }}
                        onClick={handleResend}
                        disabled={submitting}
                    >
                        Resend Code
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <div className="auth-card">
                <h1>{isRegister ? 'Create Account' : 'Log In'}</h1>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-row-review">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="search-input"
                            required
                        />
                    </div>

                    {isRegister && (
                        <div className="form-row-review">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="search-input"
                                required
                            />
                        </div>
                    )}

                    <div className="form-row-review">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="search-input"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={submitting}>
                        {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
                    </button>

                    {error && <p className="status-message error">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default AuthPage;