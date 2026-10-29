const TWO_LEVEL = new Set([
  "co.in", "org.in", "net.in", "gov.in", "ac.in", "edu.in", "firm.in", "gen.in", "ind.in",
  "co.uk", "org.uk", "ac.uk", "com.au", "net.au", "org.au", "co.jp", "co.nz", "com.sg", "com.br", "co.za", "com.cn",
]);

export function registrable(host: string): string {
  const h = host.toLowerCase().replace(/\.$/, "");
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  const last2 = parts.slice(-2).join(".");
  if (TWO_LEVEL.has(last2)) return parts.slice(-3).join(".");
  return last2;
}

export function isThirdParty(pageHost: string, reqHost: string): boolean {
  return registrable(pageHost) !== registrable(reqHost);
}
