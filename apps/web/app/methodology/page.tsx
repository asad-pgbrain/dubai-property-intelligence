import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Data Methodology",
  description:
    "How Dubai Property Intelligence sources, processes, and presents real estate market data from the Dubai Land Department.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Data Methodology
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Every number on this site comes from a traceable source. This page
            explains exactly how we collect, process, and present Dubai real
            estate data.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              1. Data Source
            </h2>
            <div className="text-zinc-700 leading-relaxed space-y-3">
              <p>
                Our primary data source is the{" "}
                <a
                  href="https://dubailand.gov.ae/en/open-data/real-estate-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Dubai Land Department (DLD) Open Data portal
                </a>
                , the official government source for registered real estate
                transactions in Dubai.
              </p>
              <p>
                We currently use the <strong>Transactions dataset</strong>,
                which includes registered sales, mortgages, and gift transfers
                with fields such as transaction date, property type, area,
                size, price, and rooms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              2. Current Data Coverage
            </h2>
            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Source
                  </dt>
                  <dd className="text-zinc-900 font-medium">
                    Dubai Land Department
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Dataset
                  </dt>
                  <dd className="text-zinc-900 font-medium">Transactions</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Period covered
                  </dt>
                  <dd className="text-zinc-900 font-medium">
                    January 2026 – October 2026
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Transactions analyzed
                  </dt>
                  <dd className="text-zinc-900 font-medium">161,561</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Areas covered
                  </dt>
                  <dd className="text-zinc-900 font-medium">273</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Last updated
                  </dt>
                  <dd className="text-zinc-900 font-medium">October 2026</dd>
                </div>
              </dl>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              3. What We Include and Exclude
            </h2>
            <div className="text-zinc-700 leading-relaxed space-y-3">
              <p>The DLD Transactions dataset contains three types of records:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Sales</strong> — actual market sales between buyers
                  and sellers. <span className="text-green-700">Included</span>{" "}
                  in all price analytics.
                </li>
                <li>
                  <strong>Mortgages</strong> — loan registrations.{" "}
                  <span className="text-red-700">Excluded</span> from price
                  benchmarks because they do not represent market prices.
                </li>
                <li>
                  <strong>Gifts</strong> — family transfers.{" "}
                  <span className="text-red-700">Excluded</span> because no
                  market price is involved.
                </li>
              </ul>
              <p className="text-sm text-zinc-500 pt-2">
                Mixing these categories would produce misleading statistics. We
                isolate <strong>Sales</strong> only.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              4. How We Calculate
            </h2>
            <div className="text-zinc-700 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Median, not mean
                </h3>
                <p>
                  Real estate prices are heavily skewed — a single AED 100M
                  penthouse can distort the average. We use the{" "}
                  <strong>median</strong> (the middle value) as the primary
                  market indicator because it is resistant to outliers. We also
                  publish 25th and 75th percentiles to show the spread.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Price per square foot
                </h3>
                <p>
                  DLD records sizes in square meters. We convert to square feet
                  using the standard conversion rate (1 sqm = 10.7639 sqft) and
                  calculate AED/sqft from the registered transaction area.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Comparable matching
                </h3>
                <p>
                  For the Property Reality Check, we match a property against
                  past transactions using a tiered approach:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>
                    <strong>Tier 1:</strong> Same area, property type, room
                    count, and similar size (±20%)
                  </li>
                  <li>
                    <strong>Tier 2:</strong> Same area, property type, and room
                    count
                  </li>
                  <li>
                    <strong>Tier 3:</strong> Same area and property type
                  </li>
                  <li>
                    <strong>Tier 4:</strong> Same area (fallback)
                  </li>
                </ul>
                <p className="text-sm text-zinc-500 mt-2">
                  We always tell you which tier was used so you can judge how
                  comparable the result is.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              5. Data Quality
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700">
              <li>
                Every raw file is stored immutably and traced to its source
                with a SHA-256 checksum.
              </li>
              <li>
                Each database record is linked to its ingestion batch, so any
                number can be traced back to the exact file and date it came
                from.
              </li>
              <li>
                Duplicate transaction records are deduplicated using DLD&apos;s
                official transaction number combined with the transaction date.
              </li>
              <li>
                Records with invalid dates, negative amounts, or zero sizes are
                quarantined and excluded from analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              6. Limitations
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 leading-relaxed space-y-2">
              <p>
                <strong>We are a research tool, not investment advice.</strong>{" "}
                We do not tell you whether to buy or sell a property.
              </p>
              <p>
                We report registered DLD transaction data. We do not include
                asking prices, listings, or off-market deals.
              </p>
              <p>
                Small sample sizes can produce unreliable statistics. We show
                a coverage indicator (High / Medium / Limited) on every result.
              </p>
              <p>
                DLD data may lag real-market activity by several weeks. We
                always show the period covered.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              7. Attribution & Licensing
            </h2>
            <p className="text-zinc-700 leading-relaxed">
              DLD data is publicly available. We do not resell raw datasets.
              Our value is in processing, calculation, presentation, and
              analytics. We always cite DLD as the original source.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Run a Property Reality Check →
          </Link>
        </div>
      </main>
    </div>
  );
}
