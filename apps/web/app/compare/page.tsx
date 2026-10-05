import type { Metadata } from "next";
import Header from "@/components/Header";
import CompareClient from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Compare Dubai Areas - Prices, Trends & Activity",
  description:
    "Compare Dubai areas side by side: median prices, AED/sqft, and transaction activity from Dubai Land Department data.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Compare Dubai Areas
          </h1>
          <p className="text-zinc-600 max-w-3xl">
            Select 2 to 6 Dubai areas and see median prices, AED per square
            foot, and transaction activity side by side — using official Dubai
            Land Department data.
          </p>
        </div>

        <CompareClient />
      </main>
    </div>
  );
}
