import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="card" style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ background: 'var(--color-warning-bg)', padding: 20, borderRadius: '50%' }}>
                    <AlertTriangle size={64} style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
                </div>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Page Not Found</h1>

            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 30, fontSize: '1.1rem' }}>
                The page you are looking for doesn't exist or has been moved.
            </p>

            <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
                <Home size={18} aria-hidden="true" />
                Return to Dashboard
            </button>
        </div>
    );
}
