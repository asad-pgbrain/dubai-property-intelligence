"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/market", label: "Market" },
  { href: "/areas", label: "Areas" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Methodology" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tight">DPI</span>
          </div>
          <span className="font-semibold text-zinc-900 text-sm">
            Dubai Property Intelligence
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-600">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "text-zinc-900 font-medium"
                    : "hover:text-zinc-900 transition"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu — simple text link to home */}
        <Link
          href="/"
          className="md:hidden text-sm text-zinc-600 hover:text-zinc-900"
        >
          Home
        </Link>
      </div>
    </header>
  );
}
