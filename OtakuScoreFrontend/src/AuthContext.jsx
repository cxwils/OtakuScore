import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from './config.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [username, setUsername] = useState(() => localStorage.getItem('username'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (username) {
            localStorage.setItem('username', username);
        } else {
            localStorage.removeItem('username');
        }
    }, [username]);

    const login = async (usernameInput, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error || 'Invalid username or password.');
        }

        const data = await res.json();
        setToken(data.token);
        setUsername(data.username);
    };

    const register = async (usernameInput, email, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, email, password }),
        });

        if (!res.ok) {
            const errors = await res.json();
            throw new Error(Array.isArray(errors) ? errors.join(', ') : 'Registration failed.');
        }
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}