import http from "node:http";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import { capture } from "../src/lib/capture";
import { analyze } from "../src/lib/analyze";
import { FIXTURES } from "../fixtures/sites";

const TESTED = [
  "trackers-before-consent",
  "cookies-before-consent",
  "no-consent-mechanism",
  "form-no-notice",
  "form-weak-consent",
  "no-policy-link",
  "policy-unreadable",
  "policy-grievance",
  "policy-contact",
  "policy-board",
  "policy-retention",
  "policy-withdraw",
  "policy-rights",
  "policy-purpose",
  "policy-data",
];

const norm = (id: string) => id.replace(/^form-\d+-/, "form-");

async function main() {
  process.env.ALLOW_PRIVATE_TARGETS = "1";
  process.env.CHROMIUM_PATH = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
  const server = http.createServer((req, res) => {
    const m = /^\/(f\d+)(\/privacy|\/)?/.exec(req.url || "");
    const fx = m && FIXTURES.find((f) => f.id === m[1]);
    if (!fx) {
      res.statusCode = 404;
      return res.end("not found");
    }
    res.setHeader("content-type", "text/html");
    if (m![2] === "/privacy") return res.end(fx.policy ?? "");
    res.end(fx.html.replace(/href="\/privacy"/g, `href="/${fx.id}/privacy"`));
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as AddressInfo).port;

  let tp = 0, fp = 0, fn = 0, tn = 0;
  const rows: { id: string; description: string; expected: string[]; got: string[]; ok: boolean }[] = [];
  for (const fx of FIXTURES) {
    const cap = await capture(`http://127.0.0.1:${port}/${fx.id}/`, {
      mock: async (page) => {
        await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
      },
    });
    const res = analyze(cap);
    const got = [...new Set(res.findings.map((f) => norm(f.id)))].filter((id) => TESTED.includes(id));
    const exp = fx.expected;
    for (const id of TESTED) {
      const e = exp.includes(id), g = got.includes(id);
      if (e && g) tp++;
      else if (!e && g) fp++;
      else if (e && !g) fn++;
      else tn++;
    }
    rows.push({ id: fx.id, description: fx.description, expected: exp, got, ok: exp.length === got.length && exp.every((x) => got.includes(x)) });
    console.log(fx.id, rows[rows.length - 1].ok ? "ok" : "MISMATCH", "expected", exp.join(",") || "-", "got", got.join(",") || "-");
  }
  server.close();
  const recall = tp / (tp + fn || 1);
  const precision = tp / (tp + fp || 1);
  const out = { sites: FIXTURES.length, labels: TESTED.length, tp, fp, fn, tn, recall, precision, exactMatchSites: rows.filter((r) => r.ok).length, rows };
  fs.mkdirSync("src/data", { recursive: true });
  fs.writeFileSync("src/data/eval.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ tp, fp, fn, recall, precision, exact: out.exactMatchSites }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
