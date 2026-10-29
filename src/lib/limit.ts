const hits = new Map<string, number[]>();
let dayStart = Date.now();
let dayCount = 0;

export function allow(ip: string, perHour = 6, perDay = 150): { ok: boolean; reason?: string } {
  const now = Date.now();
  if (now - dayStart > 86400000) {
    dayStart = now;
    dayCount = 0;
  }
  if (dayCount >= perDay) return { ok: false, reason: "The daily scan limit has been reached. Please try again tomorrow." };
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600000);
  if (recent.length >= perHour) return { ok: false, reason: "Too many scans from your network. Please try again in an hour." };
  recent.push(now);
  hits.set(ip, recent);
  dayCount++;
  return { ok: true };
}
