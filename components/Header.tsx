"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const MENU = [
  { id: "home", label: "Home", href: "/" },
  { id: "create", label: "Create", href: "/create" },
  { id: "scan", label: "Scan", href: "/scan" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const activeId =
    pathname === "/" ? "home" : pathname.startsWith("/create") ? "create" : pathname.startsWith("/scan") ? "scan" : null;

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 m-0 p-0 bg-white">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 md:px-10 py-4 md:py-5">
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="w-10 h-10 object-contain" priority />
            <span className="hidden sm:inline text-sm font-semibold text-gray-900">Traceability</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex-shrink-0 p-2 rounded-full hover:bg-black/10"
            aria-label="Menu"
          >
            <span className="material-icons text-2xl text-gray-800">menu</span>
          </button>
        </div>

        <nav className="hidden md:flex items-center">
          <div className="header-nav-container px-3 md:px-5 py-1 md:py-1.5 flex gap-2 md:gap-3">
            {MENU.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`header-nav-item flex items-center gap-1 px-3 py-1 md:py-1.5 text-sm md:text-base font-medium transition-all ${
                    isActive ? "header-nav-item-active" : ""
                  }`}
                >
                  <span className={`${isActive ? "underline underline-offset-4" : ""} hover:underline hover:underline-offset-4`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 z-50 w-full h-full bg-white md:hidden flex flex-col header-drawer-right">
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-gray-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
                <span className="text-sm font-semibold text-gray-900">Traceability</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-auto">
              {MENU.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 rounded-lg transition-colors ${
                      isActive ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className={`font-medium ${isActive ? "text-[#c41e3a] underline underline-offset-4" : ""}`}>
                      {item.label}
                    </span>
                    <span className="material-icons text-lg text-gray-500">chevron_right</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

