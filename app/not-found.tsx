import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 pb-28 pt-28">
      <p className="text-xs font-semibold uppercase tracking-label text-muted">
        404
      </p>
      <h1 className="mt-4 text-6xl font-black uppercase leading-[0.86] tracking-tight">
        Страница
        <br />
        не найдена
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center border border-ink bg-ink px-5 text-xs font-bold uppercase tracking-label text-stonepaper"
      >
        На главную
      </Link>
    </main>
  );
}
