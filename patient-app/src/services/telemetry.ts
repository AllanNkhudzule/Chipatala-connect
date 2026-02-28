import { RELAY_URL } from '../data/mockData';

export interface TelemetryReport {
    type: 'error' | 'manual';
    message: string;
    stack?: string;
    os: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
    url: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    timestamp: string;
}

export function getDeviceDetails() {
    return {
        os: navigator.platform || 'Unknown OS',
        browser: navigator.userAgent || 'Unknown Browser',
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        url: window.location.href,
    };
}

export async function sendTelemetryReport(report: Omit<TelemetryReport, 'timestamp' | 'os' | 'browser' | 'screenWidth' | 'screenHeight' | 'url'>) {
    try {
        const fullReport: TelemetryReport = {
            ...report,
            ...getDeviceDetails(),
            timestamp: new Date().toISOString(),
        };

        await fetch(`${RELAY_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullReport),
        });
    } catch (err) {
        console.error('Failed to send telemetry report', err);
    }
}

export function captureGlobalErrors() {
    window.addEventListener('error', (event) => {
        sendTelemetryReport({
            type: 'error',
            severity: 'high',
            message: event.message,
            stack: event.error?.stack || 'No stack available',
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        sendTelemetryReport({
            type: 'error',
            severity: 'high',
            message: event.reason?.message || 'Unhandled Promise Rejection',
            stack: event.reason?.stack || String(event.reason),
        });
    });
}
