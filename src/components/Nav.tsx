import Link from "next/link";

export default function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_12px_2px_rgba(45,212,191,0.7)]" />
        DPDP Scanner
      </Link>
      <nav className="flex items-center gap-x-5 text-sm text-zinc-400">
        <Link href="/" className="transition-colors hover:text-zinc-100">Scan</Link>
        <Link href="/method" className="transition-colors hover:text-zinc-100">Method and accuracy</Link>
      </nav>
    </header>
  );
}
