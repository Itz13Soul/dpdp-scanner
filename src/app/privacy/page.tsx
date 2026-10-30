import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

const ITEMS = [
  "The URL you enter is opened in a headless browser run by this site, and the page is analysed for trackers, cookies, forms and a privacy notice. Scan results are not saved.",
  "Your IP address is held in memory for a short time only to apply a fair-use limit of a few scans per hour.",
  "No visitor input is written to a database.",
  "Page views are counted with Vercel Web Analytics, which is cookieless and reports aggregate traffic only. If you accept the analytics banner, Google Analytics 4 also records anonymised visits and which features are used (for example, that a check was run, never what you type) and sets cookies. Nothing loads if you decline, and you can change your choice with Analytics settings in the footer. No advertising is used."
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-3 text-zinc-300">DPDP Scanner is a personal portfolio project by Divyansh Srivastava. This is what it does with data.</p>
      <ul className="mt-6 space-y-3 text-zinc-300">
        {ITEMS.map((t) => (
          <li key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">{t}</li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-zinc-400">Questions or removal requests: divyanshsrivastava.1301@gmail.com. This page is a plain description of the project and is not legal advice.</p>
    </main>
  );
}
