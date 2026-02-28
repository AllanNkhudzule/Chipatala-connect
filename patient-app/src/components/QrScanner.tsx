import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-hot-toast';

interface QrScannerProps {
  onResult: (result: string) => void;
}

const QR_SCANNER_ID = 'qr-scanner-container';

export default function QrScanner({ onResult }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const stopStreamAndScanner = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Also try to grab any rogue video elements from html5qrcode
    const video = document.querySelector(`#${QR_SCANNER_ID} video`) as HTMLVideoElement;
    if (video && video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Safe to ignore
      }
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode(QR_SCANNER_ID);
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    let resultHandled = false;

    function handleSuccess(decodedText: string) {
      if (resultHandled) return;
      resultHandled = true;
      stopStreamAndScanner().then(() => {
        toast.success('Camera closed.');
        onResult(decodedText);
      });
    }

    function captureStream() {
      const video = document.querySelector(`#${QR_SCANNER_ID} video`) as HTMLVideoElement;
      if (video && video.srcObject) {
        streamRef.current = video.srcObject as MediaStream;
      }
    }

    scanner.start({ facingMode: 'environment' }, config, handleSuccess, () => { })
      .then(captureStream)
      .catch((err: any) => {
        // Fallback for devices without environment camera
        scanner.start({ facingMode: 'user' }, config, handleSuccess, () => { })
          .then(captureStream)
          .catch((err2: any) => {
            const errMsg = err2?.name || err2?.message || String(err2);
            if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
              setErrorState('Permission to access camera was denied. Please allow camera access in your browser settings.');
            } else if (errMsg.includes('NotFoundError')) {
              setErrorState('No camera found on this device.');
            } else {
              setErrorState('Could not initialize the camera. Is another app using it?');
            }
          });
      });

    return () => {
      stopStreamAndScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally leaving out onResult so it doesn't re-trigger scanner

  if (errorState) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>{errorState}</p>
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          Retry Permission
        </button>
      </div>
    );
  }

  return <div id={QR_SCANNER_ID} style={{ width: '100%', maxWidth: 500, margin: 'auto' }} />;
}
