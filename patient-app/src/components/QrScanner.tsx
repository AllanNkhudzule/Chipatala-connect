import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onResult: (result: string) => void;
}

const QR_SCANNER_ID = 'qr-scanner-container';

export default function QrScanner({ onResult }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(QR_SCANNER_ID);
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    function handleSuccess(decodedText: string) {
      onResult(decodedText);
    }

    function handleError() {
      // ignore errors
    }

    scanner.start({ facingMode: 'environment' }, config, handleSuccess, handleError).catch(() => {
      // Fallback for devices without environment camera
      scanner.start({ facingMode: 'user' }, config, handleSuccess, handleError).catch(() => {
        // ignore if no camera
      });
    });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {
          // ignore stop errors
        });
      }
    };
  }, [onResult]);

  return <div id={QR_SCANNER_ID} style={{ width: '100%', maxWidth: 500, margin: 'auto' }} />;
}
