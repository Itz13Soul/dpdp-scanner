import Link from "next/link";
import Scanner from "../components/Scanner";

const CHECKS = [
  { t: "Trackers that fire before consent", b: "Analytics, ad and tag-manager requests seen before anyone clicks anything.", wide: true },
  { t: "Cookies set before consent", b: "Cookie names matched against known tracking cookies." },
  { t: "Forms that collect phone or email", b: "Checks for a notice and a consent tick beside the form, not in the footer." },
  { t: "Secure transport", b: "HTTPS, mixed content and the HSTS header.", wide: true },
  { t: "Privacy policy, item by item", b: "Twelve things the policy should tell a person, checked one by one.", wide: true },
];

const REPORT = [
  { t: "A readiness score", b: "Out of 100, with each finding weighted by how serious it is." },
  { t: "Findings with the clause", b: "Each one names the section or rule of the Act it relates to and quotes what the scanner saw." },
  { t: "Fix code you can paste", b: "A consent banner script, a notice template and a form notice, plus an ordered action list." },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <section className="relative">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-14 md:pt-20">
          <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <h1 className="font-display hero-in text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl" style={{ animationDelay: "60ms" }}>
                See what your website really does with personal data.
              </h1>
              <p className="hero-in mt-6 max-w-2xl text-lg text-zinc-300" style={{ animationDelay: "160ms" }}>
                Questionnaires record what you believe. This scanner loads your live site and records what fires before any consent, then ties each finding to India&apos;s DPDP Act and hands you fix code.
              </p>
            </div>
            <div className="hero-in glass float-y hidden rounded-2xl p-5 lg:block" style={{ animationDelay: "300ms" }}>
              <p className="text-xs text-zinc-400">Example finding, illustrative</p>
              <p className="font-display mt-1 text-lg font-semibold">Trackers fire before consent</p>
              <p className="mt-1 text-sm text-zinc-300">Analytics requests were made before the visitor chose anything.</p>
              <p className="mt-3 rounded-lg bg-indigo-300/10 px-3 py-2 text-xs text-indigo-100">Relates to section 6: consent must be free, specific and informed.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="scan" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16">
        <div className="glass rounded-3xl p-4 sm:p-6">
          <Scanner />
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          The Act&apos;s notice and consent duties start on 13 May 2027 (computed from the notification date), so treat this as a readiness check. Not legal advice. A probability, not proof.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <h2 className="font-display max-w-2xl text-3xl font-semibold sm:text-4xl">What the scanner records</h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-4">
          {CHECKS.map((c) => (
            <li key={c.t} className={`glass rounded-2xl p-5 ${c.wide ? "md:col-span-2" : ""}`}>
              <h3 className="font-display text-lg font-semibold">{c.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{c.b}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <h2 className="font-display max-w-2xl text-3xl font-semibold sm:text-4xl">What you get back</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {REPORT.map((r, i) => (
            <li key={r.t} className="rounded-2xl border border-white/10 p-6">
              <span className="font-display text-3xl font-semibold text-indigo-300">{i + 1}</span>
              <h3 className="font-display mt-3 text-xl font-semibold">{r.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{r.b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Next to cookie scanners and DPDP questionnaires</h2>
            <p className="mt-4 text-zinc-300">
              Cookie-consent platforms such as Cookiebot and OneTrust scan for cookies and manage banners. Many DPDP readiness tools are questionnaires. This one starts from what the page does, then maps it to the Act and writes the fix.
            </p>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="text-sm text-zinc-400">Checked on 12 synthetic pages with known issues</p>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <dd className="font-display text-4xl font-semibold">15/15</dd>
                <dt className="text-sm text-zinc-400">expected findings found</dt>
              </div>
              <div>
                <dd className="font-display text-4xl font-semibold">0</dd>
                <dt className="text-sm text-zinc-400">false alarms</dt>
              </div>
              <div>
                <dd className="font-display text-4xl font-semibold">12/12</dd>
                <dt className="text-sm text-zinc-400">pages matched exactly</dt>
              </div>
            </dl>
            <p className="mt-4 text-sm text-zinc-400">
              The pages were written by the developer and two rules were adjusted after the first run, so this shows the rules work as designed, not accuracy on real sites.{" "}
              <Link href="/method" className="text-indigo-200 underline-offset-4 hover:underline">Read the method</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
