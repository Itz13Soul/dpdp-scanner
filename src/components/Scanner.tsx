"use client";

import { track } from "../lib/track";
import { useState } from "react";
import type { Finding, ScanResult } from "../lib/types";
import RadarLoader from "./RadarLoader";

const SEV: Record<string, string> = {
  high: "border-red-400/40 bg-red-400/5 text-red-300",
  medium: "border-amber-400/40 bg-amber-400/5 text-amber-300",
  low: "border-sky-400/30 bg-sky-400/5 text-sky-300",
  info: "border-white/10 bg-white/[0.03] text-zinc-300",
};

function Copy({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          track("fixpack_copied");
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          setDone(false);
        }
      }}
      className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300 transition-colors hover:border-indigo-300 hover:text-indigo-200"
    >
      {done ? "Copied" : label}
    </button>
  );
}

function FindingCard({ f }: { f: Finding }) {
  return (
    <li className={`rounded-xl border p-4 ${SEV[f.severity]}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-100">{f.title}</h3>
        <span className="shrink-0 text-[10px] uppercase tracking-wide">{f.severity}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{f.detail}</p>
      {f.evidence.length ? (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 font-mono text-xs text-zinc-300">
          {f.evidence.map((e, i) => (
            <li key={i} className="break-all">{e}</li>
          ))}
        </ul>
      ) : null}
      {f.clauses.length ? (
        <div className="mt-3 space-y-1 border-t border-white/10 pt-2 text-xs text-zinc-400">
          {f.clauses.map((c) => (
            <p key={c.ref}>
              <span className="font-semibold text-zinc-200">{c.ref}.</span> {c.text}
            </p>
          ))}
        </div>
      ) : null}
      <p className="mt-2 text-xs text-indigo-200">Fix: {f.fix}</p>
    </li>
  );
}

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<ScanResult | null>(null);
  const [tab, setTab] = useState<"banner" | "notice" | "form" | "actions">("banner");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setRes(null);
    track("scan_started");
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error ?? "The scan could not be completed."); track("scan_error", { status: r.status }); }
      else { setRes(j as ScanResult); track("scan_completed", { findings: Array.isArray((j as ScanResult).findings) ? (j as ScanResult).findings.length : undefined }); }
    } catch {
      setError("The scan could not be completed. Please try again.");
    }
    setBusy(false);
  }

  const pack = res?.fixPack;
  const tabText = pack ? { banner: pack.bannerCode, notice: pack.noticeTemplate, form: pack.formNotice, actions: pack.actions.join("\n") }[tab] : "";

  return (
    <div>
      <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourstartup.in"
          aria-label="Website address"
          className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base outline-none focus:border-indigo-300"
        />
        <button
          disabled={busy || !url.trim()}
          className="rounded-xl bg-indigo-400 px-6 py-3 font-semibold text-zinc-950 transition-opacity disabled:opacity-40"
        >
          {busy ? "Scanning, about 30 seconds..." : "Scan my site"}
        </button>
      </form>
      <p className="mt-2 text-xs text-zinc-500">
        Scan only sites you own or have permission to test. The scan loads one page like a visitor, clicks nothing, and stores nothing.
      </p>
      {error ? <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-200">{error}</p> : null}

      {res ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="h-60 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
              <RadarLoader nodes={res.thirdParties.map((t) => ({ category: t.category }))} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Readiness indicator for {new URL(res.finalUrl).hostname}</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-5xl text-indigo-300">{res.score}</span>
                <span className="text-zinc-300">/ 100 · {res.band}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                {res.counts.high} high, {res.counts.medium} medium, {res.counts.low} low observations. {res.thirdParties.length} third-party hosts contacted on load.
              </p>
              <p className="mt-3 text-xs text-zinc-500">{res.notice}</p>
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold">Findings</h2>
            {res.findings.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-400">No observations from this single page load. That does not mean the site is compliant.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {res.findings.map((f) => (
                  <FindingCard key={f.id} f={f} />
                ))}
              </ul>
            )}
          </section>

          {res.thirdParties.length ? (
            <section>
              <h2 className="text-lg font-semibold">Third parties contacted before any click</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr><th className="py-2 pr-3">Host</th><th className="pr-3">Service</th><th>Type</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-zinc-300">
                    {res.thirdParties.map((t) => (
                      <tr key={t.host}><td className="py-2 pr-3 font-mono text-xs">{t.host}</td><td className="pr-3">{t.name}</td><td>{t.category}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="text-lg font-semibold">Fix pack</h2>
            <p className="mt-1 text-sm text-zinc-400">Templates to adapt. Have a lawyer review the notice before you publish it.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {([["banner", "Consent banner code"], ["notice", "Notice template"], ["form", "Form notice"], ["actions", "Action list"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-3 py-1 text-sm ${tab === k ? "border-indigo-400 bg-indigo-400/10 text-indigo-200" : "border-white/10 text-zinc-400 hover:text-zinc-100"}`}>
                  {l}
                </button>
              ))}
              <span className="ml-auto"><Copy text={tabText} label="Copy" /></span>
            </div>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-300">{tabText}</pre>
          </section>
        </div>
      ) : null}
    </div>
  );
}
