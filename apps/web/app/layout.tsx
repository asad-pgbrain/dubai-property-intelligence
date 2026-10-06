import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dubai Property Intelligence — Market Data & Reality Check",
    template: "%s | Dubai Property Intelligence",
  },
  description:
    "Check any Dubai property against real market data from the Dubai Land Department. Transactions, median prices, AED/sqft, and comparable sales — transparent, source-attributed, and free.",
  keywords: [
    "Dubai property prices",
    "Dubai real estate data",
    "Dubai Land Department",
    "property reality check",
    "Dubai Marina prices",
    "Dubai property market",
    "DLD transactions",
  ],
  authors: [{ name: "Dubai Property Intelligence" }],
  metadataBase: new URL("https://dubaipropertyintel.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dubaipropertyintel.com",
    siteName: "Dubai Property Intelligence",
    title: "Dubai Property Intelligence — Market Data & Reality Check",
    description:
      "Check any Dubai property against real market data from the Dubai Land Department.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dubai Property Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dubai Property Intelligence",
    description:
      "Check any Dubai property against real market data from DLD.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
