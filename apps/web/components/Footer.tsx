import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/market" className="hover:text-zinc-900">
                  Market
                </Link>
              </li>
              <li>
                <Link href="/areas" className="hover:text-zinc-900">
                  Areas
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-zinc-900">
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-3">
              Trust
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/methodology" className="hover:text-zinc-900">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-zinc-900">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/how-we-make-money"
                  className="hover:text-zinc-900"
                >
                  How we make money
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/privacy" className="hover:text-zinc-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-900">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wide mb-3">
              Data source
            </h3>
            <p className="text-sm text-zinc-600">
              Dubai Land Department
              <br />
              Official transactions dataset
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>© 2026 Dubai Property Intelligence</div>
          <div className="text-center md:text-right">
            Market research tool. Not investment, legal, or financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
