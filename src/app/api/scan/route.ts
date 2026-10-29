import { NextResponse } from "next/server";
import { capture } from "../../../lib/capture";
import { analyze } from "../../../lib/analyze";
import { allow } from "../../../lib/limit";
import { TargetError } from "../../../lib/target";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const gate = allow(ip);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  let url = "";
  try {
    const body = (await req.json()) as { url?: unknown };
    url = typeof body.url === "string" ? body.url : "";
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a url field." }, { status: 400 });
  }

  try {
    const cap = await Promise.race([
      capture(url),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 52000)),
    ]);
    return NextResponse.json(analyze(cap));
  } catch (e) {
    if (e instanceof TargetError) return NextResponse.json({ error: e.message }, { status: 400 });
    const msg = e instanceof Error ? e.message : "";
    if (/timeout|Timeout/.test(msg)) return NextResponse.json({ error: "The site took too long to load, so the scan was stopped." }, { status: 504 });
    if (/ERR_NAME_NOT_RESOLVED/.test(msg)) return NextResponse.json({ error: "That domain could not be found." }, { status: 400 });
    return NextResponse.json({ error: "The scan could not be completed. The site may block automated visitors." }, { status: 502 });
  }
}
