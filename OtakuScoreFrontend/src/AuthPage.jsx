import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

function AuthPage() {
    const { mode } = useParams();
    const isRegister = mode === 'register';

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (isRegister) {
                await register(username, email, password);
                navigate('/auth/login');
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
                        {submitting ? 'Please wait…' : isRegister ? 'Create Account' : 'Log In'}
                    </button>

                    {error && <p className="status-message error">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default AuthPage;