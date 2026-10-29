import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Nav from "../components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "DPDP Scanner",
  description: "See what your live website actually does with personal data, mapped to India's DPDP Act, with working fix code.",
  authors: [{ name: "Divyansh Srivastava" }],
  creator: "Divyansh Srivastava",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-zinc-100">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer className="mx-auto w-full max-w-5xl px-4 py-8 text-xs text-zinc-500">
          © 2026 Divyansh Srivastava. All rights reserved. Developed by Divyansh Srivastava. Not legal advice. A probability, not proof.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
