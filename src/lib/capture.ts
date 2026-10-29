import { chromium as pw, type Browser, type Page } from "playwright-core";
import type { Capture, FormRecord, RequestRecord } from "./types";
import { hostIsPublic, validateTarget } from "./target";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 DPDPScanner/0.1";

async function launch(): Promise<Browser> {
  if (process.env.CHROMIUM_PATH) {
    return pw.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ["--no-sandbox"] });
  }
  const sparticuz = (await import("@sparticuz/chromium")).default;
  return pw.launch({
    executablePath: await sparticuz.executablePath(),
    args: sparticuz.args,
    headless: true,
  });
}

type DomResult = {
  title: string;
  forms: (Omit<FormRecord, "index" | "fields"> & { fields: { kind: string; hint: string }[] })[];
  bannerSignals: string[];
  privacyLinks: { href: string; text: string }[];
};

function readDom(): DomResult {
  const PII: [string, RegExp][] = [
    ["email", /e-?mail/i],
    ["phone", /(phone|mobile|contact ?(no|number)|whatsapp|tel\b)/i],
    ["id", /(aadhaar|aadhar|\bpan\b|passport|driving)/i],
    ["dob", /(dob|birth)/i],
    ["address", /(address|pincode|pin ?code|zip|postal)/i],
    ["name", /(full ?name|first ?name|last ?name|your name|^name$)/i],
  ];
  const NOTICE_RE = /(privacy|consent|i agree|you agree|by (submitting|clicking|continuing|signing)|terms|we (will )?(collect|use|process|store)|your (data|information|details))/i;
  const POLICY_RE = /(privacy|data protection|गोपनीयता)/i;
  const visible = (el: Element) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    const s = getComputedStyle(el as HTMLElement);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const clean = (t: string) => t.replace(/\s+/g, " ").trim();

  const forms: DomResult["forms"] = [];
  const formEls = Array.from(document.querySelectorAll("form"));
  formEls.forEach((form) => {
    const fields: { kind: string; hint: string }[] = [];
    form.querySelectorAll("input, textarea, select").forEach((inp) => {
      const el = inp as HTMLInputElement;
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (["hidden", "submit", "button", "checkbox", "radio", "search", "password", "file"].includes(type)) return;
      const ac = (el.getAttribute("autocomplete") || "").toLowerCase();
      const label = el.id ? (form.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent ?? "") : "";
      const probe = [el.name, el.id, el.placeholder, label, el.getAttribute("aria-label") || ""].join(" ");
      let kind: string | null = null;
      if (type === "email" || ac.includes("email")) kind = "email";
      else if (type === "tel" || ac.includes("tel")) kind = "phone";
      else if (ac === "name" || ac.includes("given-name") || ac.includes("family-name")) kind = "name";
      else if (ac.includes("street-address") || ac.includes("postal-code")) kind = "address";
      else if (ac.includes("bday")) kind = "dob";
      else for (const [k, re] of PII) if (re.test(probe)) { kind = k; break; }
      if (kind) fields.push({ kind, hint: clean(el.placeholder || label || el.name || el.id || type).slice(0, 40) });
    });
    if (fields.length === 0) return;
    let scope: Element = form;
    let text = clean((form as HTMLElement).innerText || "");
    let hop = 0;
    while (text.length < 60 && scope.parentElement && hop < 2) {
      const up = scope.parentElement;
      if (up.tagName === "BODY" || up.tagName === "HTML" || clean((up as HTMLElement).innerText || "").length > 800) break;
      scope = up;
      text = clean((scope as HTMLElement).innerText || "");
      hop++;
    }
    let siblingText = "";
    if (scope === form && form.parentElement) {
      const sibs = [form.previousElementSibling, form.nextElementSibling].filter(Boolean) as Element[];
      siblingText = sibs
        .filter((s) => !["FOOTER", "NAV", "HEADER", "ASIDE"].includes(s.tagName))
        .map((s) => clean((s as HTMLElement).innerText || "").slice(0, 300))
        .join(" ");
    }
    const boxes = Array.from(scope.querySelectorAll('input[type="checkbox"]'));
    const hasConsentCheckbox = boxes.some((b) => {
      const id = (b as HTMLInputElement).id;
      const lab = id ? (scope.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent ?? "") : "";
      const near = clean((b.closest("label") ?? b.parentElement)?.textContent ?? "") + " " + lab;
      return /(agree|consent|accept|privacy|terms|whatsapp|updates|contact me)/i.test(near);
    });
    const hasPolicyLink = Array.from(scope.querySelectorAll("a")).some((a) => POLICY_RE.test(a.textContent || "") || POLICY_RE.test(a.getAttribute("href") || ""));
    const scopeClone = scope.cloneNode(true) as HTMLElement;
    scopeClone.querySelectorAll("a, script, style").forEach((n) => n.remove());
    const plain = clean(scopeClone.innerText || scopeClone.textContent || "") + " " + siblingText;
    const hasConsentWording = NOTICE_RE.test(plain) || hasConsentCheckbox;
    const btn = form.querySelector('button, input[type="submit"]') as HTMLElement | null;
    forms.push({
      fields,
      submitText: clean(btn ? (btn as HTMLInputElement).value || btn.innerText || "" : "").slice(0, 40),
      hasPolicyLink,
      hasConsentWording,
      hasConsentCheckbox,
      noticeSnippet: (text + " " + siblingText).trim().slice(0, 200),
    });
  });

  const signals: string[] = [];
  const candidates = Array.from(document.querySelectorAll("[id], [class], [role='dialog']")).filter((el) => {
    const idc = ((el as HTMLElement).id + " " + (el.getAttribute("class") || "")).toLowerCase();
    return /(cookie|consent|gdpr|cc-|privacy-banner|onetrust|cmp)/.test(idc) && visible(el);
  });
  for (const el of candidates) {
    const t = clean((el as HTMLElement).innerText || "");
    if (t.length > 20 && t.length < 1500 && /(accept|agree|allow|reject|decline|got it|ok)/i.test(t) && /(cookie|consent|privacy|data)/i.test(t)) {
      signals.push("banner-element");
      break;
    }
  }
  const dlg = Array.from(document.querySelectorAll("[role='dialog'], [aria-modal='true']")).find((el) => visible(el) && /cookie|consent/i.test((el as HTMLElement).innerText || ""));
  if (dlg) signals.push("dialog-element");

  const links = Array.from(document.querySelectorAll("a[href]"))
    .map((a) => ({ href: (a as HTMLAnchorElement).href, text: clean(a.textContent || "").slice(0, 60) }))
    .filter((l) => /^https?:/i.test(l.href) && (POLICY_RE.test(l.text) || /privacy|data-protection|dpdp/i.test(l.href)));
  return { title: document.title, forms, bannerSignals: signals, privacyLinks: links.slice(0, 8) };
}

export type CaptureOptions = { mock?: (page: Page) => Promise<void> };

export async function capture(input: string, opts: CaptureOptions = {}): Promise<Capture> {
  const target = await validateTarget(input);
  const browser = await launch();
  const requests: RequestRecord[] = [];
  try {
    const context = await browser.newContext({ userAgent: UA, viewport: { width: 1366, height: 800 }, locale: "en-IN", serviceWorkers: "block" });
    const page = await context.newPage();
    await page.addInitScript("window.__name = function (f) { return f; };");
    if (opts.mock) await opts.mock(page);
    await page.route("**/*", async (route) => {
      const u = new URL(route.request().url());
      if (u.protocol === "http:" || u.protocol === "https:") {
        if (!(await hostIsPublic(u.hostname))) return route.abort("blockedbyclient");
      } else if (u.protocol !== "data:" && u.protocol !== "blob:" && u.protocol !== "about:") {
        return route.abort("blockedbyclient");
      }
      const t = route.request().resourceType();
      if (t === "media" || t === "font") return route.abort();
      return route.fallback();
    });
    page.on("request", (req) => {
      try {
        const u = new URL(req.url());
        if (u.protocol === "http:" || u.protocol === "https:") requests.push({ url: u.origin + u.pathname, host: u.hostname, type: req.resourceType() });
      } catch {
        return;
      }
    });
    const resp = await page.goto(target.href, { waitUntil: "load", timeout: 22000 });
    await page.waitForTimeout(3500);
    const finalUrl = page.url();
    const headers = resp ? await resp.allHeaders() : {};
    const dom = await page.evaluate(readDom);
    const cookies = (await context.cookies()).map((c) => ({ name: c.name, domain: c.domain, secure: c.secure, httpOnly: c.httpOnly }));

    const finalHost = new URL(finalUrl).hostname;
    const sameSiteLinks = dom.privacyLinks.filter((l) => {
      try {
        return new URL(l.href).hostname.replace(/^www\./, "") === finalHost.replace(/^www\./, "");
      } catch {
        return false;
      }
    });
    const chosen = sameSiteLinks[0] ?? dom.privacyLinks[0] ?? null;
    let policyText = "";
    let policyUrl: string | null = chosen ? chosen.href : null;
    if (chosen) {
      try {
        const pp = await context.newPage();
        if (opts.mock) await opts.mock(pp);
        await pp.route("**/*", async (route) => {
          const u = new URL(route.request().url());
          if ((u.protocol === "http:" || u.protocol === "https:") && !(await hostIsPublic(u.hostname))) return route.abort("blockedbyclient");
          const t = route.request().resourceType();
          if (["image", "media", "font", "stylesheet"].includes(t)) return route.abort();
          return route.fallback();
        });
        await pp.goto(chosen.href, { waitUntil: "domcontentloaded", timeout: 12000 });
        await pp.waitForTimeout(1500);
        policyText = ((await pp.evaluate(() => document.body?.innerText || "")) || "").replace(/\s+/g, " ").slice(0, 120000);
        policyUrl = pp.url();
      } catch {
        policyText = "";
      }
    }

    const seen = new Set<string>();
    const unique = requests.filter((r) => {
      const k = r.host + r.url;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return {
      requestedUrl: target.href,
      finalUrl,
      title: dom.title,
      https: finalUrl.startsWith("https://"),
      hsts: Boolean(headers["strict-transport-security"]),
      requests: unique,
      cookies,
      forms: dom.forms.map((f, i) => ({ ...f, fields: f.fields as FormRecord["fields"], index: i })),
      bannerSignals: dom.bannerSignals,
      privacyLinks: dom.privacyLinks,
      policyUrl,
      policyText,
      policyReadable: policyText.length >= 600,
    };
  } finally {
    await browser.close();
  }
}
