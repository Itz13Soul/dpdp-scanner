import type { Clause } from "./types";

export const C = {
  s5: { ref: "DPDP Act s.5(1)", text: "A request for consent must come with a notice stating the data sought and its purpose, how to exercise rights under s.6(4) and s.13, and how to complain to the Board." } as Clause,
  s6_1: { ref: "DPDP Act s.6(1)", text: "Consent must be free, specific, informed, unconditional and unambiguous, given by a clear affirmative action, and limited to data necessary for the purpose." } as Clause,
  s6_4: { ref: "DPDP Act s.6(4)", text: "A Data Principal may withdraw consent at any time, and withdrawing must be about as easy as giving it." } as Clause,
  s8_5: { ref: "DPDP Act s.8(5)", text: "A Data Fiduciary must take reasonable security safeguards to prevent a personal data breach." } as Clause,
  s8_6: { ref: "DPDP Act s.8(6)", text: "After a breach, the Board and each affected Data Principal must be informed in the prescribed form and manner." } as Clause,
  s8_7: { ref: "DPDP Act s.8(7)", text: "Personal data must be erased once consent is withdrawn or the purpose is no longer served, unless law requires retention." } as Clause,
  s8_9: { ref: "DPDP Act s.8(9)", text: "The business contact of a Data Protection Officer, or a person who can answer questions, must be published." } as Clause,
  s8_10: { ref: "DPDP Act s.8(10)", text: "An effective grievance redressal mechanism must be established." } as Clause,
  s9: { ref: "DPDP Act s.9", text: "Verifiable parental consent is needed for a child's data, and tracking, behavioural monitoring or targeted advertising directed at children is barred." } as Clause,
  s11_12: { ref: "DPDP Act ss.11-12", text: "Data Principals may seek a summary of their data, correction, completion, updating and erasure." } as Clause,
  s13: { ref: "DPDP Act s.13", text: "Data Principals must have readily available means of grievance redressal." } as Clause,
  r3: { ref: "DPDP Rules 2025, r.3", text: "A notice must be clear and understandable on its own, in plain language, and itemise the data and purposes." } as Clause,
  r6: { ref: "DPDP Rules 2025, r.6", text: "Minimum safeguards include encryption, masking or tokenisation, access control, logging and backups." } as Clause,
  r8: { ref: "DPDP Rules 2025, r.8", text: "Data must be erased when the purpose is served, and logs kept for at least one year unless law requires longer." } as Clause,
  r9: { ref: "DPDP Rules 2025, r.9", text: "The contact details of the person who can answer questions about processing must be displayed on the website or app." } as Clause,
  r14: { ref: "DPDP Rules 2025, r.14", text: "Fiduciaries must publish how Data Principals can make rights requests and how grievances are handled." } as Clause,
};

export type PolicyItem = {
  id: string;
  label: string;
  re: RegExp;
  severity: "medium" | "low";
  clauses: Clause[];
  fix: string;
};

export const POLICY_ITEMS: PolicyItem[] = [
  {
    id: "policy-purpose",
    label: "Purposes of processing",
    re: /(purpose|we (use|collect|process)|how we use|use of (your )?(information|data))/i,
    severity: "medium",
    clauses: [C.s5, C.r3],
    fix: "State, per category of data, why you collect it and what the user gets in return.",
  },
  {
    id: "policy-data",
    label: "Categories of personal data collected",
    re: /(personal (data|information)|information (we|that we) collect|data (we|that we) collect|categories of)/i,
    severity: "medium",
    clauses: [C.s5, C.r3],
    fix: "List the specific personal data you collect, such as name, phone, email and device identifiers.",
  },
  {
    id: "policy-withdraw",
    label: "How to withdraw consent",
    re: /(withdraw|revoke|opt[- ]?out|unsubscribe)/i,
    severity: "medium",
    clauses: [C.s6_4, C.s5],
    fix: "Explain how a user withdraws consent, and make it as easy as giving it.",
  },
  {
    id: "policy-rights",
    label: "Rights to access, correct and erase data",
    re: /((access|correct|rectif|update|erase|erasure|delet).{0,80}(personal )?(data|information)|your rights)/i,
    severity: "medium",
    clauses: [C.s11_12, C.r14],
    fix: "Describe how users can request a summary of their data, correction and erasure, and which identifier you need to verify them.",
  },
  {
    id: "policy-grievance",
    label: "Grievance redressal mechanism",
    re: /grievance/i,
    severity: "medium",
    clauses: [C.s8_10, C.s13, C.r14],
    fix: "Publish how to raise a grievance, who handles it and the response time.",
  },
  {
    id: "policy-contact",
    label: "Contact for privacy questions",
    re: /(data protection officer|\bDPO\b|grievance officer|privacy officer|(privacy|dpo|grievance|legal)@[a-z0-9.-]+\.[a-z]{2,})/i,
    severity: "medium",
    clauses: [C.s8_9, C.r9],
    fix: "Publish a named contact or role and an email address for privacy questions.",
  },
  {
    id: "policy-board",
    label: "How to complain to the Data Protection Board",
    re: /data protection board/i,
    severity: "low",
    clauses: [C.s5],
    fix: "Add a line telling users they can complain to the Data Protection Board of India.",
  },
  {
    id: "policy-retention",
    label: "Retention and erasure",
    re: /(retain|retention|stored for|how long|(delete|erase).{0,60}(after|when|once))/i,
    severity: "medium",
    clauses: [C.s8_7, C.r8],
    fix: "State how long each category is kept and when it is erased.",
  },
  {
    id: "policy-sharing",
    label: "Sharing with processors and third parties",
    re: /(third[- ]part|processor|service provider|share (your|the)|disclos)/i,
    severity: "low",
    clauses: [C.s5],
    fix: "Name the types of processors and third parties that receive personal data, and why.",
  },
  {
    id: "policy-security",
    label: "Security safeguards",
    re: /(security|safeguard|encrypt)/i,
    severity: "low",
    clauses: [C.s8_5, C.r6],
    fix: "Summarise the safeguards you apply, such as encryption in transit and access controls.",
  },
  {
    id: "policy-children",
    label: "Children's data",
    re: /(child|children|minor|under (the age of )?18|parental)/i,
    severity: "low",
    clauses: [C.s9],
    fix: "State whether the service is meant for children, and how verifiable parental consent is obtained if it is.",
  },
  {
    id: "policy-breach",
    label: "Breach notification",
    re: /breach/i,
    severity: "low",
    clauses: [C.s8_6],
    fix: "Say that you will inform affected users and the Board in case of a personal data breach.",
  },
];
