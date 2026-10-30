import type { Metadata } from "next";
import { Geist, Inter_Tight } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ConsentAnalytics, { AnalyticsSettingsButton } from "../components/ConsentAnalytics";
import Link from "next/link";
import Nav from "../components/Nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Inter_Tight({ variable: "--font-display", subsets: ["latin"], weight: ["500","600","700"] });

export const metadata: Metadata = {
  title: "DPDP Scanner",
  description: "See what your live website actually does with personal data, mapped to India's DPDP Act, with working fix code.",
  authors: [{ name: "Divyansh Srivastava" }],
  creator: "Divyansh Srivastava",
  openGraph: { title: "DPDP Scanner", type: "website", siteName: "DPDP Scanner" },
  twitter: { card: "summary", title: "DPDP Scanner" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-zinc-100">
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
        <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-xs text-zinc-400">
          © 2026 Divyansh Srivastava. All rights reserved. Developed by Divyansh Srivastava. Not legal advice. A probability, not proof.{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-300">Privacy</Link>{" · "}<AnalyticsSettingsButton />
        </footer>
        <Analytics />
        <ConsentAnalytics app="DPDP Scanner" />
      </body>
    </html>
  );
}
