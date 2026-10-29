export type TrackerCategory = "analytics" | "advertising" | "session-replay" | "social" | "tag-manager" | "consent-platform";

export type Tracker = { name: string; category: TrackerCategory };

const LIST: [string, string, TrackerCategory][] = [
  ["google-analytics.com", "Google Analytics", "analytics"],
  ["analytics.google.com", "Google Analytics", "analytics"],
  ["googletagmanager.com", "Google Tag Manager", "tag-manager"],
  ["doubleclick.net", "Google Ads / DoubleClick", "advertising"],
  ["googleadservices.com", "Google Ads", "advertising"],
  ["googlesyndication.com", "Google AdSense", "advertising"],
  ["facebook.net", "Meta Pixel", "advertising"],
  ["facebook.com", "Meta (Facebook)", "advertising"],
  ["connect.facebook.net", "Meta Pixel", "advertising"],
  ["hotjar.com", "Hotjar", "session-replay"],
  ["hotjar.io", "Hotjar", "session-replay"],
  ["clarity.ms", "Microsoft Clarity", "session-replay"],
  ["fullstory.com", "FullStory", "session-replay"],
  ["smartlook.com", "Smartlook", "session-replay"],
  ["mouseflow.com", "Mouseflow", "session-replay"],
  ["luckyorange.com", "Lucky Orange", "session-replay"],
  ["logrocket.com", "LogRocket", "session-replay"],
  ["bing.com", "Microsoft Advertising", "advertising"],
  ["ads.linkedin.com", "LinkedIn Insight", "advertising"],
  ["snap.licdn.com", "LinkedIn Insight", "advertising"],
  ["analytics.tiktok.com", "TikTok Pixel", "advertising"],
  ["tiktok.com", "TikTok", "advertising"],
  ["ads-twitter.com", "X (Twitter) Ads", "advertising"],
  ["analytics.twitter.com", "X (Twitter) Analytics", "advertising"],
  ["pinterest.com", "Pinterest Tag", "advertising"],
  ["criteo.com", "Criteo", "advertising"],
  ["criteo.net", "Criteo", "advertising"],
  ["taboola.com", "Taboola", "advertising"],
  ["outbrain.com", "Outbrain", "advertising"],
  ["adnxs.com", "Xandr", "advertising"],
  ["amazon-adsystem.com", "Amazon Ads", "advertising"],
  ["quantserve.com", "Quantcast", "advertising"],
  ["scorecardresearch.com", "Comscore", "analytics"],
  ["mixpanel.com", "Mixpanel", "analytics"],
  ["segment.com", "Segment", "analytics"],
  ["segment.io", "Segment", "analytics"],
  ["cdn.segment.com", "Segment", "analytics"],
  ["amplitude.com", "Amplitude", "analytics"],
  ["heap.io", "Heap", "analytics"],
  ["heapanalytics.com", "Heap", "analytics"],
  ["clevertap.com", "CleverTap", "analytics"],
  ["moengage.com", "MoEngage", "analytics"],
  ["webengage.com", "WebEngage", "analytics"],
  ["branch.io", "Branch", "analytics"],
  ["appsflyer.com", "AppsFlyer", "analytics"],
  ["hubspot.com", "HubSpot", "analytics"],
  ["hs-scripts.com", "HubSpot", "analytics"],
  ["hs-analytics.net", "HubSpot", "analytics"],
  ["hsforms.com", "HubSpot Forms", "analytics"],
  ["intercom.io", "Intercom", "analytics"],
  ["intercomcdn.com", "Intercom", "analytics"],
  ["drift.com", "Drift", "analytics"],
  ["zendesk.com", "Zendesk", "analytics"],
  ["freshchat.com", "Freshchat", "analytics"],
  ["crisp.chat", "Crisp", "analytics"],
  ["tawk.to", "Tawk.to", "analytics"],
  ["mxpnl.com", "Mixpanel", "analytics"],
  ["plausible.io", "Plausible", "analytics"],
  ["cloudflareinsights.com", "Cloudflare Web Analytics", "analytics"],
  ["cookiebot.com", "Cookiebot", "consent-platform"],
  ["onetrust.com", "OneTrust", "consent-platform"],
  ["cookielaw.org", "OneTrust", "consent-platform"],
  ["cookieyes.com", "CookieYes", "consent-platform"],
  ["osano.com", "Osano", "consent-platform"],
  ["usercentrics.eu", "Usercentrics", "consent-platform"],
  ["trustarc.com", "TrustArc", "consent-platform"],
  ["iubenda.com", "iubenda", "consent-platform"],
  ["termly.io", "Termly", "consent-platform"],
  ["didomi.io", "Didomi", "consent-platform"],
  ["consentmanager.net", "consentmanager", "consent-platform"],
  ["civiccomputing.com", "Civic Cookie Control", "consent-platform"],
  ["cookiefirst.com", "CookieFirst", "consent-platform"],
  ["complianz.io", "Complianz", "consent-platform"],
];

const BY_HOST = new Map(LIST.map(([h, name, category]) => [h, { name, category } as Tracker]));

export function classifyHost(host: string): Tracker | null {
  let h = host.toLowerCase();
  while (h.includes(".")) {
    const t = BY_HOST.get(h);
    if (t) return t;
    h = h.slice(h.indexOf(".") + 1);
  }
  return null;
}

const COOKIE_PATTERNS: [RegExp, string, TrackerCategory][] = [
  [/^_ga(_.+)?$/, "Google Analytics", "analytics"],
  [/^_gid$/, "Google Analytics", "analytics"],
  [/^_gat/, "Google Analytics", "analytics"],
  [/^__utm[a-z]$/, "Google Analytics (legacy)", "analytics"],
  [/^_gcl_/, "Google Ads", "advertising"],
  [/^(IDE|test_cookie|DSID)$/, "Google DoubleClick", "advertising"],
  [/^_fbp$|^_fbc$/, "Meta Pixel", "advertising"],
  [/^_hj/, "Hotjar", "session-replay"],
  [/^_clck$|^_clsk$|^CLID$/, "Microsoft Clarity", "session-replay"],
  [/^_uetsid$|^_uetvid$/, "Microsoft Advertising", "advertising"],
  [/^_ttp$|^_tt_/, "TikTok", "advertising"],
  [/^_pin_|^_pinterest_/, "Pinterest", "advertising"],
  [/^hubspotutk$|^__hs/, "HubSpot", "analytics"],
  [/^ajs_(anonymous|user)_id$/, "Segment", "analytics"],
  [/^mp_.+_mixpanel$/, "Mixpanel", "analytics"],
  [/^amplitude_id/, "Amplitude", "analytics"],
  [/^_clck/, "Microsoft Clarity", "session-replay"],
  [/^li_|^bcookie$|^lidc$/, "LinkedIn", "advertising"],
];

export function classifyCookie(name: string): Tracker | null {
  for (const [re, tname, category] of COOKIE_PATTERNS) if (re.test(name)) return { name: tname, category };
  return null;
}
