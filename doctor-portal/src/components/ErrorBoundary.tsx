import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sendTelemetryReport } from '../services/telemetry';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        sendTelemetryReport({
            type: 'error',
            severity: 'critical',
            message: error.message,
            stack: errorInfo.componentStack || error.stack || 'No stack trace available',
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
                    <h1 style={{ marginBottom: '10px' }}>Something went wrong.</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                        We've automatically collected details about this crash and sent it to our team.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Reload Application
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <pre style={{
                            marginTop: '40px',
                            padding: '20px',
                            background: 'var(--color-surface-alt)',
                            borderRadius: 'var(--radius)',
                            textAlign: 'left',
                            overflowX: 'auto',
                            fontSize: '12px'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
