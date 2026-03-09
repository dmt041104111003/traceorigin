'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, RotateCw, AlertCircle } from 'lucide-react';

export default function ScanQR() {
  const [result, setResult] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = (results: any[]) => {
    if (results.length > 0 && !isPaused && !isProcessing) {
      setIsProcessing(true);
      const text = results[0].rawValue;
      setResult(text);
      setIsPaused(true);

      if (text.includes(window.location.origin) && text.includes('/product/')) {
        setTimeout(() => {
          window.location.href = text;
        }, 1500);
      }
    }
  };

  const handleRestart = () => {
    setResult(null);
    setIsPaused(false);
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] px-3 sm:px-4 py-6 md:py-8">
      <div className="max-w-lg mx-auto w-full space-y-3 md:space-y-4">
        <Link
          href="/"
          className="inline-block text-xs md:text-sm font-medium text-[#c41e3a] hover:text-red-700 hover:underline mb-1"
        >
          ← Back to home
        </Link>

        <div className="p-0">
          <div className="relative aspect-square">
            <Scanner
              onScan={handleScan}
              paused={isPaused}
              constraints={{
                facingMode: 'environment',
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
              }}
              scanDelay={100}
              formats={['qr_code']}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover', width: '100%', height: '100%' },
              }}
              components={{
                torch: true,
                zoom: true,
                finder: true,
              }}
              allowMultiple={false}
            />

            {!isPaused && !result && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 md:w-56 md:h-56 border-4 border-dashed border-[#c41e3a]/45 rounded-2xl" />
              </div>
            )}

            {result && (
              <div className="absolute inset-0 bg-black/80 flex items-end rounded-md overflow-hidden">
                <div className="w-full p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-base font-bold text-white mb-1">Scan successful!</p>
                  {result.includes('/product/') && result.includes(window.location.origin) ? (
                    <p className="text-white/90 text-sm">Redirecting…</p>
                  ) : (
                    <p className="text-white/90 text-xs break-all bg-black/50 rounded px-3 py-2 mt-2">
                      {result}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-0">
          {!result ? (
            <p className="text-gray-600 text-sm text-center">
              Tip: good lighting and steady hands improve speed.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {!result.includes('/product/') && !result.includes(window.location.origin) && (
                <div className="flex items-center gap-1.5 text-amber-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Not a system traceability QR</span>
                </div>
              )}
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c41e3a] text-white font-semibold text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Scan another
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          Good lighting · 4–8 in away · Hold steady
        </p>
      </div>
    </main>
  );
}