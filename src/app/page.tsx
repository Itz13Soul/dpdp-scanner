import Link from "next/link";
import Scanner from "../components/Scanner";

export default function Home() {
  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-12 md:pt-16">
        <h1 className="font-display hero-in max-w-3xl text-4xl font-semibold leading-[1.1] sm:text-5xl">
          See what your website really does with personal data.
        </h1>
        <p className="hero-in mt-5 max-w-2xl text-lg text-zinc-300" style={{ animationDelay: "100ms" }}>
          Enter a site you own. The scanner loads it like a visitor, records what fires before any consent, and links each finding to India&apos;s DPDP Act with fix code.
        </p>
      </section>

      <section id="scan" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-8">
        <Scanner />
        <p className="mt-4 text-sm text-zinc-400">
          The Act&apos;s notice and consent duties start on 13 May 2027 (computed from the notification date), so this is a readiness check. Not legal advice. A probability, not proof.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <p className="max-w-2xl text-zinc-300">
          You get a score out of 100, each finding with the section of the Act it relates to, and paste-ready fix code: a consent banner, a notice template and an action list. Cookie-consent platforms such as Cookiebot and OneTrust manage banners, and many DPDP tools are questionnaires. This starts from what the page does.
        </p>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Checked on 12 synthetic pages written by me: 15 of 15 expected findings, no false alarms. Two rules were adjusted after the first run, so this is not accuracy on real sites.{" "}
          <Link href="/method" className="text-indigo-200 underline-offset-4 hover:underline">Method</Link>
        </p>
      </section>
    </main>
  );
}
