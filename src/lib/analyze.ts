import { classifyCookie, classifyHost } from "./trackers";
import { C, POLICY_ITEMS } from "./clauses";
import type { Capture, Finding, ScanResult, Severity } from "./types";
import { isThirdParty } from "./domains";
import { buildFixPack } from "./fixpack";

export const NOTICE =
  "Technical observations from one automated page load, not legal advice. The DPDP Act's notice and consent duties start on 13 May 2027 (computed from the notification date), so this is a readiness check. A finding is a probability that something needs attention, not proof of a violation.";

const WEIGHT: Record<Severity, number> = { high: 12, medium: 6, low: 2, info: 0 };

export function thirdPartySummary(c: Capture) {
  const pageHost = new URL(c.finalUrl).hostname;
  const map = new Map<string, { host: string; name: string; category: string; beforeConsent: boolean }>();
  for (const r of c.requests) {
    if (!isThirdParty(pageHost, r.host)) continue;
    if (map.has(r.host)) continue;
    const t = classifyHost(r.host);
    map.set(r.host, { host: r.host, name: t?.name ?? "Unclassified third party", category: t?.category ?? "other", beforeConsent: true });
  }
  return [...map.values()];
}

export function analyze(c: Capture): ScanResult {
  const findings: Finding[] = [];
  const tp = thirdPartySummary(c);
  const trackers = tp.filter((t) => ["analytics", "advertising", "session-replay", "social", "tag-manager"].includes(t.category));
  const consentPlatform = tp.some((t) => t.category === "consent-platform");
  const hasBanner = c.bannerSignals.length > 0 || consentPlatform;

  if (trackers.length > 0) {
    const heavy = trackers.some((t) => t.category === "advertising" || t.category === "session-replay");
    const names = [...new Set(trackers.map((t) => `${t.name} (${t.category})`))];
    findings.push({
      id: "trackers-before-consent",
      severity: heavy ? "high" : "medium",
      title: `${names.length} tracking service${names.length === 1 ? "" : "s"} contacted before any consent action`,
      detail: hasBanner
        ? "A consent banner appears to exist, but these services were contacted during the initial page load, before any click. Gating the scripts behind the banner is the usual fix."
        : "No consent banner was detected, and these services were contacted during the initial page load.",
      evidence: names.slice(0, 12),
      clauses: [C.s6_1, C.s5],
      fix: "Load analytics, advertising and session-replay scripts only after the visitor accepts. See the generated consent snippet.",
    });
  }

  const trackingCookies = c.cookies
    .map((k) => ({ k, t: classifyCookie(k.name) }))
    .filter((x) => x.t && x.t.category !== "consent-platform");
  if (trackingCookies.length > 0) {
    const heavy = trackingCookies.some((x) => x.t!.category === "advertising" || x.t!.category === "session-replay");
    findings.push({
      id: "cookies-before-consent",
      severity: heavy ? "high" : "medium",
      title: `${trackingCookies.length} tracking cookie${trackingCookies.length === 1 ? "" : "s"} set before any consent action`,
      detail: "These cookies were present after the first page load with no interaction.",
      evidence: trackingCookies.slice(0, 12).map((x) => `${x.k.name} (${x.t!.name}, ${x.k.domain})`),
      clauses: [C.s6_1],
      fix: "Do not set analytics or advertising cookies until consent is recorded.",
    });
  }

  if (trackers.length > 0 && !hasBanner) {
    findings.push({
      id: "no-consent-mechanism",
      severity: "high",
      title: "No consent banner or consent platform detected",
      detail: "The page loads tracking services but shows no recognisable consent control. A custom banner that my checks did not recognise is possible.",
      evidence: ["No consent platform script and no banner-like element with accept or reject controls"],
      clauses: [C.s6_1, C.s6_4],
      fix: "Add a consent banner with accept and reject choices of equal prominence, and a way to change the choice later.",
    });
  }

  for (const f of c.forms) {
    const kinds = [...new Set(f.fields.map((x) => x.kind))];
    const shows = f.hasPolicyLink || f.hasConsentWording;
    if (!shows) {
      findings.push({
        id: `form-${f.index}-no-notice`,
        severity: "high",
        title: `Form ${f.index + 1} collects ${kinds.join(", ")} with no notice at the point of collection`,
        detail: "No privacy link or consent wording was found inside or next to the form.",
        evidence: [`Fields: ${f.fields.map((x) => x.hint).slice(0, 6).join(", ")}`, `Button: ${f.submitText || "(none)"}`],
        clauses: [C.s5, C.s6_1, C.r3],
        fix: "Add a short notice above the button stating what is collected and why, with a link to the privacy policy.",
      });
    } else if (!f.hasConsentCheckbox && !f.hasConsentWording) {
      findings.push({
        id: `form-${f.index}-weak-consent`,
        severity: "low",
        title: `Form ${f.index + 1} links to a policy but shows no explicit consent wording`,
        detail: "A policy link is present, but nothing tells the user that submitting means agreeing to the stated purpose.",
        evidence: [`Fields: ${f.fields.map((x) => x.hint).slice(0, 6).join(", ")}`],
        clauses: [C.s6_1],
        fix: "Add wording such as 'By submitting, you agree to us using your details to contact you about this request', or a checkbox.",
      });
    }
  }

  if (!c.https) {
    findings.push({
      id: "no-https",
      severity: "high",
      title: "The site is served over plain HTTP",
      detail: "Data entered on the page travels unencrypted.",
      evidence: [c.finalUrl],
      clauses: [C.s8_5, C.r6],
      fix: "Serve the site over HTTPS and redirect all HTTP traffic.",
    });
  } else {
    const mixed = c.requests.filter((r) => r.url.startsWith("http://")).slice(0, 5);
    if (mixed.length > 0) {
      findings.push({
        id: "mixed-content",
        severity: "medium",
        title: "Some requests on this HTTPS page use plain HTTP",
        detail: "Mixed content weakens the encryption of the page.",
        evidence: mixed.map((r) => r.host),
        clauses: [C.s8_5, C.r6],
        fix: "Update every resource URL to HTTPS.",
      });
    }
    if (!c.hsts) {
      findings.push({
        id: "no-hsts",
        severity: "low",
        title: "No HSTS header on the main page",
        detail: "Browsers are not told to insist on HTTPS for this site.",
        evidence: ["Strict-Transport-Security header absent"],
        clauses: [C.s8_5],
        fix: "Send a Strict-Transport-Security header with a long max-age.",
      });
    }
  }

  if (!c.policyUrl) {
    findings.push({
      id: "no-policy-link",
      severity: "high",
      title: "No privacy policy link found on the page",
      detail: "No link with privacy-related text or address was found on the scanned page.",
      evidence: c.privacyLinks.length ? c.privacyLinks.map((l) => l.text) : ["No candidate links"],
      clauses: [C.s5, C.r3, C.r14],
      fix: "Link a privacy policy from the footer and from every form that collects personal data.",
    });
  } else if (!c.policyReadable) {
    findings.push({
      id: "policy-unreadable",
      severity: "info",
      title: "The privacy policy could not be read automatically",
      detail: "The linked page returned too little text, for example because it loads inside a script or a document. Policy checks were skipped.",
      evidence: [c.policyUrl],
      clauses: [],
      fix: "Publish the policy as plain HTML text so users and tools can read it.",
    });
  } else {
    for (const item of POLICY_ITEMS) {
      const m = item.re.exec(c.policyText);
      if (!m) {
        findings.push({
          id: item.id,
          severity: item.severity,
          title: `Policy does not appear to cover: ${item.label.toLowerCase()}`,
          detail: "No matching wording was found. A keyword check can miss unusual phrasing, so read the policy to confirm.",
          evidence: [`Searched ${c.policyUrl}`],
          clauses: item.clauses,
          fix: item.fix,
        });
      }
    }
  }

  const counts = { high: 0, medium: 0, low: 0 };
  for (const f of findings) if (f.severity === "high" || f.severity === "medium" || f.severity === "low") counts[f.severity]++;
  const penalty = findings.reduce((a, f) => a + WEIGHT[f.severity], 0);
  const score = Math.max(0, 100 - penalty);
  const band = score >= 85 ? "Few issues observed" : score >= 60 ? "Some issues observed" : score >= 35 ? "Many issues observed" : "Serious gaps observed";

  const result: ScanResult = {
    url: c.requestedUrl,
    finalUrl: c.finalUrl,
    scannedAt: new Date().toISOString(),
    score,
    band,
    counts,
    thirdParties: tp,
    findings: findings.sort((a, b) => WEIGHT[b.severity] - WEIGHT[a.severity]),
    fixPack: { bannerCode: "", noticeTemplate: "", formNotice: "", actions: [] },
    notice: NOTICE,
  };
  result.fixPack = buildFixPack(result, c);
  return result;
}
