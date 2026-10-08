import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Dubai Property Intelligence collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 mb-10">
          Last updated: October 2026
        </p>

        <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed space-y-6">
          <p>
            Dubai Property Intelligence (&quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) is committed to protecting your privacy. This
            policy explains what information we collect, how we use it, and
            your rights.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            1. Information we collect
          </h2>
          <p>
            We collect minimal personal information. Our product is designed to
            be usable without registration.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Usage data:</strong> Anonymous analytics such as pages
              visited, browser type, and general geographic region (country
              level). We do not track individual users.
            </li>
            <li>
              <strong>Property searches:</strong> When you use our tools, the
              values you enter (area, price, size) are used to generate your
              result. We may store anonymized, aggregated queries to improve
              our service.
            </li>
            <li>
              <strong>Contact information:</strong> If you voluntarily email us
              or subscribe to updates, we store your email address only to
              respond or send the updates you requested.
            </li>
          </ul>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            2. How we use information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To operate, maintain, and improve the platform</li>
            <li>To understand which features are useful and which are not</li>
            <li>To respond to your questions and feedback</li>
            <li>To detect and prevent abuse or security issues</li>
          </ul>
          <p>
            We do not sell your personal information. We do not share it with
            third parties for marketing purposes.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            3. Cookies
          </h2>
          <p>
            We use minimal cookies and similar technologies for basic
            functionality (such as remembering your language preference) and
            anonymous analytics. You can disable cookies in your browser
            settings.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            4. Third-party services
          </h2>
          <p>
            We use the following third-party services that may process data on
            our behalf:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Vercel:</strong> Hosting and edge infrastructure
            </li>
            <li>
              <strong>Neon:</strong> Database hosting
            </li>
            <li>
              <strong>Analytics providers:</strong> Anonymous usage analytics
            </li>
          </ul>
          <p>
            Each of these providers maintains its own privacy policy. We
            selected them in part because of their strong privacy practices.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            5. Data retention
          </h2>
          <p>
            Anonymous analytics are retained for up to 24 months. Contact
            emails are retained as long as necessary to respond to your query
            or until you request deletion.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            6. Your rights
          </h2>
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, or delete your personal information. You may also have the
            right to object to certain processing. To exercise any of these
            rights, contact us at{" "}
            <span className="font-mono text-sm">
              privacy@dubaipropertyintel.com
            </span>
            .
          </p>
          <p>
            For users in the European Union, United Kingdom, or other
            jurisdictions with comprehensive data protection laws, we comply
            with applicable requirements under GDPR/UK GDPR. We process data
            based on legitimate interest (operating our service), consent
            (where required), and contractual necessity.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            7. Children&apos;s privacy
          </h2>
          <p>
            Our service is not directed to children under 16. We do not
            knowingly collect personal information from children.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            8. Changes to this policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Material
            changes will be reflected by a new &quot;last updated&quot; date at
            the top of this page.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            9. Contact
          </h2>
          <p>
            For privacy-related questions, contact us at{" "}
            <span className="font-mono text-sm">
              privacy@dubaipropertyintel.com
            </span>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
