export type Fixture = { id: string; description: string; html: string; policy?: string | null; expected: string[] };

const FULL_POLICY = `<html><body><h1>Privacy Policy</h1>
<p>Purpose: we collect your name, email and phone to respond to your enquiry. The personal data we collect is limited to these categories.</p>
<p>You may withdraw consent at any time by writing to privacy@acme.example. You can access, correct or erase your personal information, and this is described under your rights.</p>
<p>Grievance: our grievance officer, the Data Protection Officer, can be reached at dpo@acme.example. You may also complain to the Data Protection Board of India.</p>
<p>Retention: we retain data for twelve months and delete it once the purpose is served. We share data with service providers acting as processors. We apply security safeguards including encryption. Children under 18 are not our audience without parental consent. In case of a breach we will inform you and the Board.</p>
<p>${"This policy is reviewed regularly and updated when our practices change. ".repeat(6)}</p></body></html>`;

const PARTIAL_POLICY = `<html><body><h1>Privacy Policy</h1>
<p>Purpose: we use your personal data to respond to your requests. The personal data we collect includes name and email. You may withdraw consent by email. You can access, correct or erase your personal information on request. We share data with service providers. We apply security safeguards including encryption. Children under 18 are not our audience. In case of a breach we will inform you.</p>
<p>${"This policy is reviewed regularly and updated when our practices change. ".repeat(8)}</p></body></html>`;

const SHORT_POLICY = `<html><body><h1>Privacy</h1><p>Contact us for details.</p></body></html>`;

const banner = `<div id="cookie-banner" style="position:fixed;bottom:0;left:0;right:0;padding:16px;background:#222;color:#fff"><p>We use cookies for analytics. Please accept or reject.</p><button>Accept</button><button>Reject</button></div>`;
const goodForm = `<form action="/x" method="post"><p>By submitting you agree that Acme may use your details to reply to you. See our <a href="/privacy">Privacy Policy</a>.</p><input type="email" name="email" placeholder="Email"><input type="tel" name="phone" placeholder="Phone"><button>Send</button></form>`;
const footer = `<footer><a href="/privacy">Privacy Policy</a></footer>`;
const ga = `<script src="https://www.googletagmanager.com/gtag/js?id=G-TEST"></script><script>document.cookie="_ga=GA1.2.111.222; path=/";</script>`;
const meta = `<script src="https://connect.facebook.net/en_US/fbevents.js"></script><script>document.cookie="_fbp=fb.1.123.456; path=/";</script>`;
const hotjar = `<script src="https://static.hotjar.com/c/hotjar-1.js"></script>`;

const page = (body: string, head = "") => `<!doctype html><html><head><title>Acme</title>${head}</head><body><h1>Acme</h1><p>Welcome.</p>${body}</body></html>`;

export const FIXTURES: Fixture[] = [
  { id: "f01", description: "Clean: banner, no trackers, notice form, full policy", html: page(banner + goodForm + footer), policy: FULL_POLICY, expected: [] },
  { id: "f02", description: "Analytics fires with an own banner present", html: page(banner + footer + ga), policy: FULL_POLICY, expected: ["trackers-before-consent", "cookies-before-consent"] },
  { id: "f03", description: "Meta pixel and Hotjar, no banner", html: page(footer + meta + hotjar), policy: FULL_POLICY, expected: ["trackers-before-consent", "cookies-before-consent", "no-consent-mechanism"] },
  { id: "f04", description: "Consent platform script present but analytics still fires", html: page(footer + `<script src="https://consent.cookiebot.com/uc.js"></script>` + ga), policy: FULL_POLICY, expected: ["trackers-before-consent", "cookies-before-consent"] },
  { id: "f05", description: "Contact form with no notice", html: page(`<form action="/x"><input type="email" name="email" placeholder="Email"><input type="tel" name="phone" placeholder="Phone"><button>Send</button></form>` + footer), policy: FULL_POLICY, expected: ["form-no-notice"] },
  { id: "f06", description: "Form with only a policy link, no consent wording", html: page(`<form action="/x"><input type="email" name="email" placeholder="Email"><a href="/privacy">Privacy Policy</a><button>Send</button></form>` + footer), policy: FULL_POLICY, expected: ["form-weak-consent"] },
  { id: "f07", description: "No privacy policy link anywhere", html: page(banner + `<form action="/x"><p>By submitting you agree to our use of your details to reply.</p><input type="email" name="email"><button>Send</button></form>`), policy: null, expected: ["no-policy-link"] },
  { id: "f08", description: "Policy lacks grievance, contact, board and retention", html: page(banner + goodForm + footer), policy: PARTIAL_POLICY, expected: ["policy-grievance", "policy-contact", "policy-board", "policy-retention"] },
  { id: "f09", description: "Policy page too short to read", html: page(banner + goodForm + footer), policy: SHORT_POLICY, expected: ["policy-unreadable"] },
  { id: "f10", description: "Footer newsletter form with consent line", html: page(`<footer><form action="/n"><input type="email" name="email" placeholder="Your email"><button>Subscribe</button><p>By subscribing you agree to receive updates. Your data is used only for this.</p></form><a href="/privacy">Privacy Policy</a></footer>`), policy: FULL_POLICY, expected: [] },
  { id: "f11", description: "Search form only, no personal data", html: page(`<form action="/s"><input type="search" name="q" placeholder="Search"><button>Go</button></form>` + footer), policy: FULL_POLICY, expected: [] },
  { id: "f12", description: "Phone form with the notice in a paragraph above it", html: page(`<section><p>We collect your phone number to call you back about your request. See the policy for details.</p><form action="/x"><input type="tel" name="mobile" placeholder="Mobile"><button>Call me</button></form></section>` + footer), policy: FULL_POLICY, expected: [] },
];
