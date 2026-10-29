import type { Capture, ScanResult } from "./types";

export function buildFixPack(r: ScanResult, c: Capture): ScanResult["fixPack"] {
  const gated = r.thirdParties.filter((t) => ["analytics", "advertising", "session-replay", "social", "tag-manager"].includes(t.category));
  const names = [...new Set(gated.map((t) => t.name))];
  const bannerCode = `<div id="consent-bar" role="dialog" aria-label="Cookie choices" hidden style="position:fixed;bottom:0;left:0;right:0;padding:16px;background:#111;color:#fff;font:14px system-ui;z-index:9999">
  <p style="margin:0 0 8px">We use cookies for analytics${names.length ? ` (${names.slice(0, 4).join(", ")})` : ""} only if you agree. You can change this any time from the footer link "Cookie choices".</p>
  <button id="consent-accept">Accept</button>
  <button id="consent-reject">Reject</button>
</div>
<script>
(function () {
  var KEY = "consent-v1";
  var bar = document.getElementById("consent-bar");
  function load() {
    document.querySelectorAll('script[type="text/plain"][data-consent="analytics"]').forEach(function (s) {
      var n = document.createElement("script");
      if (s.src) n.src = s.src; else n.text = s.text;
      document.head.appendChild(n);
    });
  }
  var saved = localStorage.getItem(KEY);
  if (saved === "accepted") load();
  if (!saved) bar.hidden = false;
  document.getElementById("consent-accept").onclick = function () { localStorage.setItem(KEY, "accepted"); bar.hidden = true; load(); };
  document.getElementById("consent-reject").onclick = function () { localStorage.setItem(KEY, "rejected"); bar.hidden = true; };
  window.openCookieChoices = function () { localStorage.removeItem(KEY); bar.hidden = false; };
})();
</script>
<!-- Change each tracking script to: <script type="text/plain" data-consent="analytics" src="..."></script> -->`;

  const noticeTemplate = `PRIVACY NOTICE (template, adapt to your business)

Who we are: [Company legal name], [address]. Privacy contact: [name or role], [email].

What we collect and why:
- [Name, phone, email] to [respond to your enquiry / deliver your order].
- [Device and usage data] to [understand how the site is used], only if you accept analytics cookies.

Who receives it: [payment provider, hosting provider, analytics provider], only as needed for the purposes above.

How long we keep it: [period] after [event], then we erase it unless the law requires us to keep it.

Your rights: you can ask for a summary of your data, ask us to correct or erase it, and withdraw your consent at any time as easily as you gave it, by writing to [email]. We will respond within [period].

Complaints: write to our privacy contact first. If unresolved, you can complain to the Data Protection Board of India.

Children: [This service is not meant for children under 18 / we obtain verifiable parental consent as follows].

Security: we protect data with [encryption in transit, access controls, backups] and will inform you and the Board if a breach affects you.`;

  const formNotice = `<p class="form-notice">By submitting, you agree that [Company] may use your [name, phone, email] to [purpose]. We keep it for [period]. See our <a href="/privacy">privacy policy</a>. You can withdraw consent any time by writing to [email].</p>`;

  const order = ["high", "medium", "low"] as const;
  const actions = order.flatMap((s) => r.findings.filter((f) => f.severity === s).map((f) => `[${s.toUpperCase()}] ${f.fix}`));
  void c;
  return { bannerCode, noticeTemplate, formNotice, actions: [...new Set(actions)] };
}
