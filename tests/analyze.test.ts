import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/lib/analyze";
import type { Capture } from "../src/lib/types";

const base: Capture = {
  requestedUrl: "https://shop.example.in/",
  finalUrl: "https://shop.example.in/",
  title: "Shop",
  https: true,
  hsts: true,
  requests: [],
  cookies: [],
  forms: [],
  bannerSignals: ["banner-element"],
  privacyLinks: [{ href: "https://shop.example.in/privacy", text: "Privacy" }],
  policyUrl: "https://shop.example.in/privacy",
  policyText: "x".repeat(700),
  policyReadable: true,
};

test("an advertising tracker before consent is high severity and cites the consent clause", () => {
  const r = analyze({ ...base, requests: [{ url: "https://connect.facebook.net/x.js", host: "connect.facebook.net", type: "script" }] });
  const f = r.findings.find((x) => x.id === "trackers-before-consent");
  assert.ok(f);
  assert.equal(f!.severity, "high");
  assert.ok(f!.clauses.some((c) => c.ref === "DPDP Act s.6(1)"));
});

test("first-party and consent-platform hosts alone raise no tracker finding", () => {
  const r = analyze({
    ...base,
    requests: [
      { url: "https://cdn.shop.example.in/a.js", host: "cdn.shop.example.in", type: "script" },
      { url: "https://consent.cookiebot.com/uc.js", host: "consent.cookiebot.com", type: "script" },
    ],
  });
  assert.equal(r.findings.some((x) => x.id === "trackers-before-consent"), false);
});

test("the score never reaches a claim of compliance and never goes below zero", () => {
  const r = analyze({ ...base, https: false, policyUrl: null, privacyLinks: [], policyText: "", policyReadable: false });
  assert.ok(r.score >= 0 && r.score < 100);
  assert.match(r.notice, /not legal advice/i);
  assert.ok(!/compliant/i.test(r.band));
});

test("policy items missing are reported with clauses, not as violations", () => {
  const r = analyze({ ...base, policyText: "We sell shoes. ".repeat(60) });
  const g = r.findings.find((x) => x.id === "policy-grievance");
  assert.ok(g && g.clauses.some((c) => c.ref.includes("8(10)")));
  assert.match(g!.title, /does not appear to cover/);
});
