import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How We Make Money",
  description:
    "How Dubai Property Intelligence plans to be sustainable without compromising trust.",
};

export default function HowWeMakeMoneyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
          How We Make Money
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 mt-6 mb-10 leading-relaxed">
          Most property websites make money from brokers or developers. That
          creates a conflict of interest: they benefit when you buy through
          them. We don&apos;t want that.
        </p>

        <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 my-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2 mt-0">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                ✓
              </span>
              Our promise
            </h2>
            <p className="text-blue-900 m-0 font-medium">
              Data is free. Tools are free. We will never sell your data, take
              broker money for rankings, or show sponsored listings disguised
              as research.
            </p>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Current status: free
          </h2>
          <p>
            Right now, everything is free and no money is being made. We are
            focused on building the most useful Dubai property research tool
            and earning the trust of buyers, investors, and researchers. This
            is a long-term project.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Future plans
          </h2>
          <p>
            To keep the platform sustainable and free for everyone, we plan to
            explore the following revenue models — in this order, and only if
            we can preserve our neutrality:
          </p>

          <div className="space-y-4 not-prose">
            <div className="border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Priority 1
                </span>
                Premium research reports
              </h3>
              <p className="text-sm text-zinc-600 m-0">
                Detailed market reports with deeper analysis for serious
                investors and professionals. Basic tools stay free forever.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Priority 2
                </span>
                Pro subscription for professionals
              </h3>
              <p className="text-sm text-zinc-600 m-0">
                Alerts, unlimited reports, CSV export, and API access for
                brokers, analysts, and researchers. Does not influence
                rankings or data shown to free users.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                  Priority 3
                </span>
                Data licensing & custom research
              </h3>
              <p className="text-sm text-zinc-600 m-0">
                Custom market reports for journalists, funds, and developers.
                Available only after confirming data licensing rights with DLD.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                  Priority 3
                </span>
                Newsletter sponsorship
              </h3>
              <p className="text-sm text-zinc-600 m-0">
                Non-property sponsors (fintech, banking, insurance) may
                sponsor our data newsletter. Clearly labeled. Never replaces
                neutral analysis.
              </p>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            What we will never do
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6">
            <ul className="space-y-3 text-red-900 m-0 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <span>
                  <strong>Sell your personal data</strong> — ever. Your searches
                  and usage stay private.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <span>
                  <strong>Sell rankings or placements</strong> — no
                  &quot;featured&quot; areas or sponsored market data.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <span>
                  <strong>Take broker commissions</strong> on leads or
                  transactions in ways that bias our analysis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <span>
                  <strong>Show display ads</strong> from developers or agents
                  that could compromise our neutrality.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <span>
                  <strong>Sell or redistribute raw DLD data</strong> without
                  confirming licensing rights with the Dubai Land Department.
                </span>
              </li>
            </ul>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Our commitment to neutrality
          </h2>
          <p>
            The entire value of this platform depends on trust. If we
            compromise on that, we have nothing. That&apos;s why we&apos;re
            publishing this page — so you can hold us to it.
          </p>
          <p>
            When we do eventually charge for something, it will be for
            additional analysis and tools — never to hide or manipulate the
            data you can already see for free.
          </p>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 md:p-8 my-8">
            <p className="text-zinc-700 m-0">
              Have feedback on this approach? Disagree with something? We
              genuinely want to hear it. Email us at{" "}
              <span className="font-mono text-sm">
                hello@dubaipropertyintel.com
              </span>
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            See also:{" "}
            <Link href="/about" className="text-blue-600 hover:underline">
              About us
            </Link>{" "}
            ·{" "}
            <Link href="/methodology" className="text-blue-600 hover:underline">
              Data methodology
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy policy
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
