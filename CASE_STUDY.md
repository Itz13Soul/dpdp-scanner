# DPDP Scanner: case study

**Problem.** The DPDP Act's notice and consent duties start on 13 May 2027. Small sites do not know what their pages do before a visitor consents.

**Existing tools.** Saral Privacy, Sprinto and DPDP Core are questionnaires or platforms. Cookiebot and Blacklight scan trackers but do not map them to the Act.

**What I built.** Enter an address. A headless browser loads the live page, clicks nothing, and records third-party services contacted, cookies set, forms collecting personal data and whether a notice shows, and the privacy policy. Each finding quotes the relevant Section or Rule. The scan ends with a fix pack: consent-banner code, notice template, form notice and a prioritised list.

**Decisions.**
- Rules decide findings, not an AI model, so results repeat exactly.
- Private and internal network addresses are refused, including inside the browser.
- Nothing is stored; no account.
- Every result says: not legal advice, a probability, not proof.

**Evidence.** 12 synthetic pages with known issues: 15 of 15 expected findings found, no false alarms, 12 of 12 pages matched. Two rules were adjusted after the first run missed items, and the pages are mine, so this shows the rules work as designed and says nothing about real-site accuracy.

**Limits.** One page load, no clicking, nothing behind login. The tracker list is curated, not exhaustive. Policy checks use keywords. Sites that block automated visitors cannot be scanned.

**Next.** Hand-verify about 20 real sites with owners' permission.

Live: https://dpdp-scanner-seven.vercel.app
