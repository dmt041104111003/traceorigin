import Link from "next/link";
import { QrCode, Camera } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f2f2f2] px-4 py-8 md:py-10">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.18em]">
            Verified on Cardano
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
            Product Traceability System
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Scan a QR to verify origin, or generate a traceability QR for a product.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto mt-6 md:mt-8">
          <Link
            href="/create"
            className="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6 hover:border-[#c41e3a]/60 hover:bg-red-50/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-red-50">
                <QrCode className="w-5 h-5 text-[#c41e3a]" />
              </span>

              <div className="flex-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Create QR Code
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter product info and generate a traceability QR code.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#c41e3a] group-hover:text-red-700">
                  Start creating
                  <span aria-hidden>→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/scan"
            className="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-6 hover:border-[#c41e3a]/60 hover:bg-red-50/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-red-50">
                <Camera className="w-5 h-5 text-[#c41e3a]" />
              </span>

              <div className="flex-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Scan QR Code
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Use your camera to view the product journey instantly.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#c41e3a] group-hover:text-red-700">
                  Start scanning
                  <span aria-hidden>→</span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        <footer className="mt-8 text-center text-xs text-gray-500">
          © 2026 Product Traceability System • Secure • Transparent • Reliable
        </footer>
      </div>
    </main>
  );
}