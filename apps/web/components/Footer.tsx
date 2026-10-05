import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>© 2026 Dubai Property Intelligence</div>
          <div className="flex items-center gap-6">
            <Link href="/methodology" className="hover:text-zinc-900">
              Methodology
            </Link>
            <Link href="/data-sources" className="hover:text-zinc-900">
              Data Sources
            </Link>
            <Link href="/disclaimer" className="hover:text-zinc-900">
              Disclaimer
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-400 text-center">
          Market research tool. Not investment, legal, or financial advice.
        </div>
      </div>
    </footer>
  );
}
