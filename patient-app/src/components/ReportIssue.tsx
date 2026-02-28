import { useState } from 'react';
import { sendTelemetryReport, TelemetryReport } from '../services/telemetry';

export default function ReportIssue() {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [severity, setSeverity] = useState<TelemetryReport['severity']>('low');
    const [steps, setSteps] = useState('');
    const [expected, setExpected] = useState('');
    const [actual, setActual] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!steps.trim() || !actual.trim()) return;

        setSubmitting(true);
        await sendTelemetryReport({
            type: 'manual',
            severity,
            stepsToReproduce: steps,
            expectedBehavior: expected,
            actualBehavior: actual,
            message: 'User reported issue',
        });
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
            setOpen(false);
            setSuccess(false);
            setSteps('');
            setExpected('');
            setActual('');
            setSeverity('low');
        }, 2000);
    };

    return (
        <>
            <button
                className="btn btn-secondary"
                style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, borderRadius: '20px', padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                onClick={() => setOpen(true)}
            >
                🐞 Report Issue
            </button>

            {open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }} onClick={() => setOpen(false)}>
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="card-header" style={{ marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Report an Issue</h2>
                            <button className="btn btn-icon btn-ghost" onClick={() => setOpen(false)}>✕</button>
                        </div>

                        {success ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 10 }}>✅</div>
                                <h3>Report Submitted!</h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Thank you for helping us improve.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Severity Level</label>
                                    <select className="form-control" value={severity} onChange={e => setSeverity(e.target.value as any)}>
                                        <option value="critical">Critical (Crash, data loss)</option>
                                        <option value="high">High (Major feature broken)</option>
                                        <option value="medium">Medium (Partly broken, workaround exists)</option>
                                        <option value="low">Low (UI glitch, typo, minor issue)</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Steps to Reproduce</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="1. Go to...\n2. Click on...\n3. See error..."
                                        rows={4}
                                        required
                                        value={steps}
                                        onChange={e => setSteps(e.target.value)}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Expected Behavior</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="What should have happened?"
                                        rows={2}
                                        value={expected}
                                        onChange={e => setExpected(e.target.value)}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Actual Behavior</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="What actually happened?"
                                        rows={2}
                                        required
                                        value={actual}
                                        onChange={e => setActual(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)} disabled={submitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting || !steps.trim() || !actual.trim()}>
                                        {submitting ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
