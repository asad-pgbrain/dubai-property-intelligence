import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Market Reports",
  description:
    "Data-driven Dubai real estate market reports based on official DLD transaction data.",
};

export default function ReportsPage() {
  const reports = [
    {
      slug: "q3-2026",
      title: "Q3 2026 Market Report",
      period: "July – September 2026",
      description:
        "Quarterly analysis of Dubai property sales: volume, median prices, top areas, and off-plan trends.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
          Market Reports
        </h1>
        <p className="text-base md:text-lg text-zinc-600 mb-10 max-w-3xl">
          Data-driven Dubai property market analysis based on official Dubai
          Land Department transaction data.
        </p>

        <div className="space-y-4">
          {reports.map((r) => (
            <Link
              key={r.slug}
              href={`/reports/${r.slug}`}
              className="block bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">
                    {r.period}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2">
                    {r.title}
                  </h2>
                  <p className="text-sm md:text-base text-zinc-600">
                    {r.description}
                  </p>
                </div>
                <span className="text-zinc-400 text-2xl flex-shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
