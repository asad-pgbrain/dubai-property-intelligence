import Link from "next/link";
import { DATA_STATS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12">
        {/* Top: Brand + Columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-6 mb-8">
          {/* Brand — spans 2 cols on desktop */}
          <div className="col-span-2 md:col-span-2 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[10px] tracking-tight">
                  DPI
                </span>
              </div>
              <span className="font-semibold text-zinc-900 text-sm">
                Dubai Property Intelligence
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              Free market research platform built on official Dubai Land
              Department data. No ads. No broker money. Just data.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Updated {DATA_STATS.periodLabel}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/market" className="hover:text-zinc-900 transition">
                  Market
                </Link>
              </li>
              <li>
                <Link href="/rents" className="hover:text-zinc-900 transition">
                  Rents
                </Link>
              </li>
              <li>
                <Link href="/areas" className="hover:text-zinc-900 transition">
                  Areas
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-zinc-900 transition">
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider mb-3">
              Tools
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link
                  href="/calculators/rental-yield"
                  className="hover:text-zinc-900 transition"
                >
                  Yield Calculator
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-900 transition">
                  Reality Check
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-zinc-900 transition">
                  Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider mb-3">
              Trust
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link
                  href="/methodology"
                  className="hover:text-zinc-900 transition"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-zinc-900 transition">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/how-we-make-money"
                  className="hover:text-zinc-900 transition"
                >
                  How We Make Money
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/privacy" className="hover:text-zinc-900 transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-900 transition">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center md:justify-start">
            <span>© 2026 Dubai Property Intelligence</span>
            <span className="hidden md:inline text-zinc-300">·</span>
            <span>Data: Dubai Land Department</span>
          </div>
          <div className="text-center md:text-right">
            Market research tool. Not investment, legal, or financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
