import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DATA_STATS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dubai Property Intelligence is a free, data-first research platform built on official Dubai Land Department transaction data.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6 tracking-tight">
          About Dubai Property Intelligence
        </h1>

        <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed space-y-6">
          <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
            Dubai Property Intelligence is a free research platform that helps
            buyers, investors, and researchers understand Dubai real estate
            through transparent, source-attributed data from the Dubai Land
            Department.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Why we built this
          </h2>
          <p>
            Dubai&apos;s real estate market is one of the most active in the
            world. But for most people — especially international buyers and
            first-time investors — it&apos;s also one of the least transparent.
          </p>
          <p>
            Listing portals show asking prices. Brokers show sponsored
            inventory. Nobody shows what properties actually sold for, at
            scale, in an easy format.
          </p>
          <p>
            That&apos;s the gap we fill. We take official DLD transaction data
            — the same data the government uses — and turn it into simple,
            understandable market intelligence.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            What we do
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Aggregate and normalize {DATA_STATS.totalSales.toLocaleString()}{" "}
              registered sales across {DATA_STATS.totalAreas} Dubai areas
            </li>
            <li>
              Calculate median prices, AED/sqft, and price ranges using
              robust statistical methods
            </li>
            <li>
              Show how any asking price compares to actual market activity
              through our Reality Check tool
            </li>
            <li>
              Publish area-level market summaries that anyone can read,
              understand, and act on
            </li>
          </ul>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            What we don&apos;t do
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We don&apos;t sell listings or take broker money</li>
            <li>We don&apos;t give investment advice</li>
            <li>We don&apos;t hide our sources or methods</li>
            <li>We don&apos;t require registration to see data</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Our data
          </h2>
          <p>
            All market data comes from the{" "}
            <a
              href="https://dubailand.gov.ae/en/open-data/real-estate-data/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Dubai Land Department Open Data portal
            </a>
            . We currently cover:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
              <div className="text-2xl font-bold text-zinc-900 mb-1">
                {DATA_STATS.totalSales.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                Registered sales
              </div>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
              <div className="text-2xl font-bold text-zinc-900 mb-1">
                {DATA_STATS.totalAreas}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                Dubai areas
              </div>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
              <div className="text-2xl font-bold text-zinc-900 mb-1">
                {DATA_STATS.periodLabel}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                Period covered
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-500">
            For full details on our calculation methods and limitations, see
            our{" "}
            <Link href="/methodology" className="text-blue-600 hover:underline">
              data methodology page
            </Link>
            .
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Contact
          </h2>
          <p>
            Questions, feedback, or corrections? We&apos;re actively developing
            this platform and welcome input from buyers, agents, researchers,
            and journalists.
          </p>
          <p>
            Email: <span className="font-mono text-sm">hello@dubaipropertyintel.com</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
