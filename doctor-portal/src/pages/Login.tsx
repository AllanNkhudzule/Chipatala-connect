import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RELAY_URL } from '../data/mockData';
import toast from 'react-hot-toast';
import { HeartPulse, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect already-authenticated users
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const validateEmail = (value: string) => {
        if (!value) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
        return '';
    };

    const validatePassword = (value: string) => {
        if (!value) return 'Password is required.';
        return '';
    };

    const handleBlurEmail = () => setEmailError(validateEmail(email));
    const handleBlurPassword = () => setPasswordError(validatePassword(password));

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        setEmailError(eErr);
        setPasswordError(pErr);
        if (eErr || pErr) return;

        setLoading(true);
        setAuthError('');
        try {
            const res = await fetch(`${RELAY_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'doctor', email, password }),
            });
            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem('token', token);
                toast.success('Signed in successfully');
                const from = (location.state as any)?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                setAuthError('Invalid credentials. Please try again.');
            }
        } catch {
            setAuthError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-background)',
        }}>
            <div className="card center-card" style={{ maxWidth: 400, width: '100%', padding: '2.5rem' }}>
                {/* Wordmark */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                    <HeartPulse size={28} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)' }}>Chipatala Connect</span>
                </div>
                <p style={{ textAlign: 'center', marginBottom: 28, color: 'var(--color-text-secondary)', fontSize: '.9rem' }}>
                    Doctor Portal — Sign in to access patient records
                </p>

                {authError && (
                    <div style={{
                        background: 'var(--color-danger-bg, #fef2f2)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius)',
                        padding: '10px 14px',
                        color: 'var(--color-danger)',
                        fontSize: '.875rem',
                        marginBottom: 16,
                    }}>
                        {authError}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label htmlFor="doctor-email">Email address</label>
                        <input
                            id="doctor-email"
                            className={`form-control${emailError ? ' input-error' : ''}`}
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={handleBlurEmail}
                            placeholder="doctor@hospital.mw"
                            disabled={loading}
                        />
                        {emailError && <span className="field-error">{emailError}</span>}
                    </div>
                    <div className="form-group" style={{ marginTop: 14 }}>
                        <label htmlFor="doctor-password">Password</label>
                        <input
                            id="doctor-password"
                            className={`form-control${passwordError ? ' input-error' : ''}`}
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={handleBlurPassword}
                            placeholder="••••••••"
                            disabled={loading}
                        />
                        {passwordError && <span className="field-error">{passwordError}</span>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 22, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} strokeWidth={1.75} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                                Signing in…
                            </>
                        ) : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}
