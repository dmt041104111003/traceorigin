 "use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Shield, LayoutDashboard, QrCode, ScanLine, Settings, LogOut } from "lucide-react";
import Image from "next/image";

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-900 hover:bg-red-50/60 hover:text-[#c41e3a] transition-colors"
    >
      <span className="w-5 h-5 text-[#c41e3a]">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-gray-900">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white">
          <div className="px-5 py-5 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <Image src="/logo.svg" alt="Admin logo" width={32} height={32} className="w-8 h-8 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Admin Console</p>
              <p className="text-sm font-semibold text-gray-900 truncate">Traceability Ops</p>
            </div>
          </div>

          <nav className="px-4 py-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
            <NavItem href="/create" icon={<QrCode className="w-5 h-5" />} label="Issue QR" />
            <NavItem href="/scan" icon={<ScanLine className="w-5 h-5" />} label="Scan" />
          </nav>

          <div className="mt-auto px-4 py-4 border-t border-gray-200 space-y-1">
            <NavItem href="/dashboard" icon={<Settings className="w-5 h-5" />} label="Settings" />
            <NavItem href="/" icon={<LogOut className="w-5 h-5" />} label="Exit to site" />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
            <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Operations</p>
                <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">System overview</h1>
              </div>
              <div className="hidden sm:flex items-center gap-2" />
              <button
                type="button"
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <span className="material-icons text-xl text-gray-800">menu</span>
              </button>
            </div>
          </div>

          <main className="px-4 md:px-8 py-6">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 md:hidden header-drawer-right flex flex-col">
            <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                  <Image src="/logo.svg" alt="Admin logo" width={28} height={28} className="w-7 h-7 object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Admin</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">Traceability Ops</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close navigation"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
              <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
              <NavItem href="/create" icon={<QrCode className="w-5 h-5" />} label="Issue QR" />
              <NavItem href="/scan" icon={<ScanLine className="w-5 h-5" />} label="Scan" />
            </nav>

            <div className="px-3 py-4 border-t border-gray-200 space-y-1">
              <NavItem href="/dashboard" icon={<Settings className="w-5 h-5" />} label="Settings" />
              <NavItem href="/" icon={<LogOut className="w-5 h-5" />} label="Exit to site" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

