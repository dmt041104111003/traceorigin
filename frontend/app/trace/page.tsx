'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import { CheckCircle, RotateCw, AlertCircle } from 'lucide-react';
import { LanguageProvider } from '@/context/LanguageProvider';
import { Header } from '@/components/Header';

export default function TraceScanPage() {
  const [result, setResult] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = (results: any[]) => {
    if (results.length > 0 && !isPaused && !isProcessing) {
      setIsProcessing(true);
      const text = results[0].rawValue;
      setResult(text);
      setIsPaused(true);
      if (text.includes(window.location.origin) && text.includes('/trace/')) {
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
    <LanguageProvider>
      <Header />
      <main className="min-h-screen bg-[#f2f2f2] flex flex-col pt-[72px] md:pt-[88px]">
        <div className="flex-1 flex flex-col min-h-0 px-3 py-2 md:px-4 md:py-3 max-w-lg mx-auto w-full">
          <div className="flex-shrink-0 text-center mb-2 md:mb-3">
            <p className="text-gray-600 text-sm">
              Point camera at QR code · Place inside frame to view traceability
            </p>
          </div>

          <div className="flex-1 min-h-0 relative aspect-square max-h-[60vh]">
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
                <div className="w-48 h-48 md:w-56 md:h-56 border-4 border-dashed border-[#c41e3a]/50 rounded-2xl animate-pulse" />
              </div>
            )}

            {result && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                <div className="w-full p-4 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-lg font-bold text-white mb-1">Scan successful!</p>
                  {result.includes('/trace/') && result.includes(window.location.origin) ? (
                    <p className="text-white/90 text-sm">Redirecting...</p>
                  ) : (
                    <p className="text-white/90 text-xs break-all bg-black/50 rounded px-3 py-2 mt-2">
                      {result}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 p-3 md:p-4">
              {!result ? (
                <p className="text-gray-600 text-sm text-center">
                  Hold steady inside the frame for faster scanning
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {!result.includes('/trace/') && !result.includes(window.location.origin) && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Not a system traceability QR</span>
                    </div>
                  )}
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c41e3a] hover:bg-[#a81930] text-white font-semibold text-sm rounded-lg shadow transition-all"
                  >
                    <RotateCw className="w-4 h-4" />
                    Scan another
                  </button>
                </div>
              )}
          </div>

          <p className="flex-shrink-0 text-center text-xs text-gray-500 mt-2">
            Good lighting · 4–8 in away · Hold steady
          </p>
        </div>
      </main>
    </LanguageProvider>
  );
}
