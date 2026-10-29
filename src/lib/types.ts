export type Severity = "high" | "medium" | "low" | "info";

export type RequestRecord = { url: string; host: string; type: string };
export type CookieRecord = { name: string; domain: string; secure: boolean; httpOnly: boolean };

export type FieldKind = "email" | "phone" | "name" | "id" | "address" | "dob";

export type FormRecord = {
  index: number;
  fields: { kind: FieldKind; hint: string }[];
  submitText: string;
  hasPolicyLink: boolean;
  hasConsentWording: boolean;
  hasConsentCheckbox: boolean;
  noticeSnippet: string;
};

export type Capture = {
  requestedUrl: string;
  finalUrl: string;
  title: string;
  https: boolean;
  hsts: boolean;
  requests: RequestRecord[];
  cookies: CookieRecord[];
  forms: FormRecord[];
  bannerSignals: string[];
  privacyLinks: { href: string; text: string }[];
  policyUrl: string | null;
  policyText: string;
  policyReadable: boolean;
};

export type Clause = { ref: string; text: string };

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence: string[];
  clauses: Clause[];
  fix: string;
};

export type ScanResult = {
  url: string;
  finalUrl: string;
  scannedAt: string;
  score: number;
  band: string;
  counts: { high: number; medium: number; low: number };
  thirdParties: { host: string; name: string; category: string; beforeConsent: boolean }[];
  findings: Finding[];
  fixPack: { bannerCode: string; noticeTemplate: string; formNotice: string; actions: string[] };
  notice: string;
};
