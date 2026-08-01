"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "トップ" },
  { href: "/timeline", label: "時系列" },
  { href: "/facts", label: "問題点" },
  { href: "/evidence", label: "記録・証拠" },
  { href: "/voices", label: "利用者の声" },
  { href: "/updates", label: "最新情報" },
  { href: "/action", label: "アクション" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#1a4d2e] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-sm font-bold leading-tight max-w-[200px] hover:text-green-200 transition-colors">
            稲毛海浜公園<br />
            <span className="text-green-300 text-xs font-normal">多目的広場問題を記録する</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-white text-[#1a4d2e] font-bold"
                    : "hover:bg-green-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
          >
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden pb-3 border-t border-green-700 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-white text-[#1a4d2e] font-bold"
                    : "hover:bg-green-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
