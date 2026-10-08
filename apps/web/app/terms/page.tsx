import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using Dubai Property Intelligence.",
  openGraph: {
    type: "website",
    url: "https://dubai-property-intelligence-apps.vercel.app/terms",
    title: "Terms of Service | Dubai Property Intelligence",
    description:
      "Terms and conditions for using our free Dubai property research platform.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 mb-10">
          Last updated: October 2026
        </p>

        <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed space-y-6">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and
            use of Dubai Property Intelligence (the &quot;Service&quot;).
            By using the Service, you agree to these Terms.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            1. What the Service is
          </h2>
          <p>
            Dubai Property Intelligence is a free research platform that
            provides market intelligence based on official Dubai Land
            Department transaction data. We provide information to help you
            understand Dubai real estate markets. We do not sell, list, or
            broker properties.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            2. Not investment advice
          </h2>
          <p>
            <strong>
              The Service does not provide investment, legal, tax, or financial
              advice.
            </strong>{" "}
            All data, statistics, and analysis are for informational purposes
            only. You should consult qualified professionals (licensed brokers,
            lawyers, financial advisors) before making any real estate
            decision.
          </p>
          <p>
            We do not recommend that you buy, sell, hold, or avoid any
            property. Market data can be useful, but it is not a prediction or
            guarantee of future outcomes.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            3. Data accuracy
          </h2>
          <p>
            We take data quality seriously and publish our{" "}
            <a href="/methodology" className="text-blue-600 hover:underline">
              methodology
            </a>{" "}
            openly. However:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Data is provided &quot;as is&quot; without warranty of any kind
            </li>
            <li>
              We do not guarantee that data is complete, current, or error-free
            </li>
            <li>
              Underlying DLD data may contain errors or omissions that we
              cannot control
            </li>
            <li>
              We are not liable for any decision made based on the Service
            </li>
          </ul>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            4. Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to scrape, abuse, or overload our infrastructure</li>
            <li>Reverse-engineer, copy, or redistribute the Service</li>
            <li>Misrepresent our data as your own or as investment advice</li>
            <li>
              Use automated systems to access the Service at a rate that
              exceeds reasonable personal use
            </li>
          </ul>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            5. Intellectual property
          </h2>
          <p>
            The Service, including its design, code, calculations, and
            presentation, is owned by Dubai Property Intelligence. Underlying
            DLD data is publicly available and remains the property of the
            Dubai Land Department.
          </p>
          <p>
            You may use our data and analysis for personal, non-commercial
            research purposes. For commercial use, bulk access, or
            redistribution, contact us at{" "}
            <span className="font-mono text-sm">
              hello@dubaipropertyintel.com
            </span>
            .
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            6. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, Dubai Property Intelligence
            and its operators shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use
            of the Service. This includes but is not limited to: lost profits,
            lost opportunities, or losses related to real estate transactions.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            7. Service availability
          </h2>
          <p>
            We aim to keep the Service available and accurate but make no
            guarantees. We may modify, suspend, or discontinue parts of the
            Service at any time without notice.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            8. Changes to these Terms
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Service after changes constitutes acceptance of the new Terms.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            9. Governing law
          </h2>
          <p>
            These Terms are governed by the laws of the United Arab Emirates.
            Any disputes arising from use of the Service shall be resolved in
            the courts of Dubai.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            10. Contact
          </h2>
          <p>
            Questions about these Terms? Contact us at{" "}
            <span className="font-mono text-sm">
              hello@dubaipropertyintel.com
            </span>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
