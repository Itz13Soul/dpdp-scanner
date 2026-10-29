# Case study: DPDP Scanner

**Problem.** Most DPDP tools are questionnaires. A founder answers what they believe, while the site may load trackers before consent or collect phone numbers with no notice.

**What I built.** A scanner that loads the live site in a headless browser and records what fires before any click, then maps findings to DPDP Act sections and Rules and generates fix code. It runs inside a Vercel function and stores nothing.

**Decisions.** Rules, not an AI model, decide findings, so a scan repeats exactly and each finding can quote its clause. The clause text was checked against the Act on India Code. The scanner refuses private network targets. Results say "observed", never "compliant".

**Result.** On 12 synthetic pages: 15 of 15 expected findings, no false alarms. The set is mine and two rules were adjusted after the first run, so this is a design check, not real-world accuracy.

**Finding about the law.** The Act's main duties start on 13 May 2027, so the product is positioned as a readiness check.

**Limits and next.** One page, keyword-based policy checks. Next: hand-verify on 20 real sites with permission, add weekly re-scans with email alerts.
