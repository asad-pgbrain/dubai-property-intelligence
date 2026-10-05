import RealityCheckForm from "@/components/RealityCheckForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">DPI</span>
            </div>
            <span className="font-semibold text-zinc-900 text-sm">
              Dubai Property Intelligence
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-600">
            <a href="/market" className="hover:text-zinc-900 transition">Market</a>
            <a href="/areas" className="hover:text-zinc-900 transition">Areas</a>
            <a href="/methodology" className="hover:text-zinc-900 transition">Methodology</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            161,000+ transactions from Dubai Land Department
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight leading-tight">
            Dubai Property Intelligence,
            <br />
            <span className="text-blue-600">Without the Guesswork</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
            Check any Dubai property against real market data — transactions,
            prices per sqft, and comparable sales. No ads. No listings. Just data.
          </p>
        </div>

        <RealityCheckForm />

        {/* Trust signals */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 mb-1">161,561</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Transactions analyzed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 mb-1">273</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Dubai areas covered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 mb-1">DLD</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Official data source
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div>
              © 2026 Dubai Property Intelligence
            </div>
            <div className="flex items-center gap-6">
              <a href="/methodology" className="hover:text-zinc-900">Methodology</a>
              <a href="/data-sources" className="hover:text-zinc-900">Data Sources</a>
              <a href="/disclaimer" className="hover:text-zinc-900">Disclaimer</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-400 text-center">
            Market research tool. Not investment, legal, or financial advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
