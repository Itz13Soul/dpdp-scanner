import evalData from "../../data/eval.json";

export const metadata = { title: "Method and accuracy | DPDP Scanner" };

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function Method() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
      <h1 className="text-3xl font-semibold tracking-tight">Method and accuracy</h1>

      <h2 className="mt-8 text-lg font-semibold">What a scan does</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-300">
        <li>Validates the address, refusing private or internal network targets.</li>
        <li>Opens the page in a fresh headless browser with no stored data, waits for it to load, and clicks nothing.</li>
        <li>Records every host contacted, every cookie set, every form that collects personal data, any consent banner, and the privacy policy link.</li>
        <li>Reads the linked privacy policy and checks it against a 12-item checklist built from the Act and Rules.</li>
        <li>Applies fixed rules to produce findings, each with the clause it relates to. No AI model decides a finding, so results are repeatable.</li>
      </ol>

      <h2 className="mt-8 text-lg font-semibold">Why this is different</h2>
      <p className="mt-2 text-zinc-300">
        Saral Privacy, Sprinto and DPDP Core are questionnaires or full compliance platforms, and generic cookie scanners such as Cookiebot or Blacklight do not map findings to the DPDP Act. This tool records what the live site does, ties each observation to an Act section or Rule, and generates working fix code. The wedge is narrow: one page, deterministic rules, no account.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Accuracy so far</h2>
      <p className="mt-2 text-zinc-300">
        I ran the scanner on {evalData.sites} test pages I wrote, each with known issues, checking {evalData.labels} finding types. It found {evalData.tp} of {evalData.tp + evalData.fn} expected findings (recall {pct(evalData.recall)}) with {evalData.fp} false alarms (precision {pct(evalData.precision)}), and matched the exact expected set on {evalData.exactMatchSites} of {evalData.sites} pages.
      </p>
      <p className="mt-2 text-sm text-amber-200">
        Read this score with care. The pages are synthetic and written by me, and I adjusted two rules after the first run showed misses, so the set is not independent. It shows the rules work as designed. It does not predict accuracy on real sites. A hand-verified run on 20 real sites with owners&apos; permission is still to do.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500"><tr><th className="py-2 pr-3">Page</th><th className="pr-3">Case</th><th>Result</th></tr></thead>
          <tbody className="divide-y divide-white/10 text-zinc-300">
            {evalData.rows.map((r) => (
              <tr key={r.id}><td className="py-2 pr-3 font-mono text-xs">{r.id}</td><td className="pr-3">{r.description}</td><td>{r.ok ? "match" : "differs"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Limits</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
        <li>One page load. Consent given after a click, pages behind a login, and other pages of the site are not examined.</li>
        <li>The tracker list is a curated set of well-known services, not exhaustive. Unlisted trackers appear as unclassified third parties.</li>
        <li>Policy checks look for wording with keywords. Unusual phrasing can be missed, and present wording is not proof that it is adequate.</li>
        <li>Whether a given identifier is personal data, and whether consent is needed, is a legal question. These are technical observations.</li>
        <li>Sites that block automated visitors cannot be scanned.</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Dates</h2>
      <p className="mt-2 text-sm text-zinc-400">
        The Rules were notified on 13 November 2025. Sections 5 to 10 and Rules 3 and 5 to 16 start 18 months after 13 November 2025, which is 13 May 2027 (computed, per the Act&apos;s own commencement footnote and G.S.R. 843(E)). Consent manager provisions start a year after.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Your data</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Scan results are returned to you and not stored. No company scores are published or shared.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Sources</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
        <li><a className="underline" href="https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf" target="_blank" rel="noopener noreferrer">Digital Personal Data Protection Act, 2023 (India Code)</a></li>
        <li><a className="underline" href="https://www.dsci.in/files/content/documents/2025/Digital-Personal-Data-Protection-Rules-2025.pdf" target="_blank" rel="noopener noreferrer">Digital Personal Data Protection Rules, 2025 (DSCI copy)</a></li>
        <li><a className="underline" href="https://dpdprules.org/timeline" target="_blank" rel="noopener noreferrer">DPDP commencement timeline (dpdprules.org)</a></li>
      </ul>
      <p className="mt-6 text-xs text-zinc-500">Not legal advice. A probability, not proof.</p>
    </main>
  );
}
