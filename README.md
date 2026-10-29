# DPDP Scanner

Enter a website address. A headless browser loads the live page, clicks nothing, and records what happens before any consent: third-party services contacted, cookies set, forms that collect personal data and whether a notice is shown, and the privacy policy. Each finding quotes the DPDP Act section or Rule it relates to, and the scan ends with a fix pack: consent-banner code, a notice template, a form notice and a prioritised action list.

Not legal advice. Findings are technical observations: a probability, not proof. The Act's notice and consent duties start on 13 May 2027 (computed from the notification date), so this is a readiness check.

## Best existing tools and the wedge

Saral Privacy, Sprinto and DPDP Core are questionnaires or compliance platforms. Cookiebot and Blacklight scan trackers but do not map them to the DPDP Act. This tool records what the live site does, ties each observation to a clause, and generates fix code. The wedge is narrow: a single page, deterministic rules, no account.

## How it works

- `src/lib/target.ts`: validates the address and refuses private or internal networks (including per-request checks inside the browser).
- `src/lib/capture.ts`: Playwright with `@sparticuz/chromium`, so it runs inside a Vercel function.
- `src/lib/analyze.ts`: fixed rules produce findings. No AI model decides a finding, so results repeat exactly.
- `src/lib/clauses.ts`: the clauses and the 12-item policy checklist, checked against the Act text on India Code.
- `src/lib/fixpack.ts`: templates for the fix pack.

Nothing is stored. Rate limits are in memory.

## Accuracy

`npm run eval` runs the scanner on 12 synthetic test pages with known issues (`fixtures/sites.ts`) and writes `src/data/eval.json`. Current result: 15 of 15 expected findings found, no false alarms, 12 of 12 pages matched exactly. Two rules were adjusted after the first run showed misses, and the pages are my own, so this shows the rules work as designed and does not predict accuracy on real sites. A hand-verified run on 20 real sites with owners' permission is still to do.

## Limits

One page load, no clicking, no pages behind login. The tracker list is curated and not exhaustive. Policy checks use keywords. Sites that block automated visitors cannot be scanned.

## Run locally

```
npm install
npm run dev
```

For local scans, set `CHROMIUM_PATH` to a Chrome or Chromium binary. Never set `ALLOW_PRIVATE_TARGETS` on a public deployment.

Copyright (c) 2026 Divyansh Srivastava. All rights reserved. See LICENSE.

Run `npm run eval` to regenerate the accuracy figures.
