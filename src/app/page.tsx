import Scanner from "../components/Scanner";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16">
      <section className="rise pt-10">
        <div className="text-xs uppercase tracking-wide text-teal-300">DPDP readiness, from evidence</div>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          See what your website really does with personal data.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-400">
          Questionnaires record what you believe. This scanner loads your live site and records what fires before any consent: trackers, cookies, and forms that collect phone numbers or emails. Each finding quotes the DPDP clause it relates to, and you get fix code.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500">
          The Act&apos;s notice and consent duties start on 13 May 2027 (computed from the notification date), so treat this as a readiness check.
        </p>
      </section>
      <section className="mt-8">
        <Scanner />
      </section>
    </main>
  );
}
