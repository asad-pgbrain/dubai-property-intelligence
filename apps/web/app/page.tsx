import RealityCheckForm from "@/components/RealityCheckForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <Header />

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

      <Footer />
    </div>
  );
}
