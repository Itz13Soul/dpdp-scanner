import { lookup } from "node:dns/promises";
import net from "node:net";

export class TargetError extends Error {}

function ipv4Private(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && p[2] === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  return false;
}

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return ipv4Private(ip);
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::") return true;
  if (v.startsWith("::ffff:")) return ipv4Private(v.slice(7));
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb")) return true;
  return false;
}

const cache = new Map<string, boolean>();

export async function hostIsPublic(host: string): Promise<boolean> {
  if (process.env.ALLOW_PRIVATE_TARGETS === "1") return true;
  const key = host.toLowerCase();
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  let ok = false;
  try {
    if (net.isIP(key)) ok = !isPrivateIp(key);
    else {
      const addrs = await lookup(key, { all: true });
      ok = addrs.length > 0 && addrs.every((a) => !isPrivateIp(a.address));
    }
  } catch {
    ok = false;
  }
  cache.set(key, ok);
  return ok;
}

export function normalizeInput(input: string): URL {
  const raw = input.trim();
  if (!raw || raw.length > 300) throw new TargetError("Enter a website address.");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    throw new TargetError("That does not look like a valid website address.");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new TargetError("Only http and https addresses can be scanned.");
  if (u.username || u.password) throw new TargetError("Addresses with credentials are not accepted.");
  if (u.port && process.env.ALLOW_PRIVATE_TARGETS !== "1" && !["80", "443"].includes(u.port)) throw new TargetError("Only standard ports are accepted.");
  if (process.env.ALLOW_PRIVATE_TARGETS !== "1" && net.isIP(u.hostname.replace(/^\[|\]$/g, ""))) throw new TargetError("Enter a domain name, not an IP address.");
  if (process.env.ALLOW_PRIVATE_TARGETS !== "1" && !u.hostname.includes(".")) throw new TargetError("Enter a full domain name such as example.com.");
  u.hash = "";
  return u;
}

export async function validateTarget(input: string): Promise<URL> {
  const u = normalizeInput(input);
  if (!(await hostIsPublic(u.hostname))) throw new TargetError("That address is not reachable from the public internet, so it cannot be scanned.");
  return u;
}
