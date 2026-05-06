import Link from "next/link";
import { Footer } from "@/components/footer";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { getPublicDrops } from "@/lib/db/drops";
import { formatDateRu } from "@/lib/utils";

export default async function DropsArchivePage() {
  const result = await getPublicDrops();
  const drops = result.drops.filter(
    (drop) => drop.status === "live" || drop.status === "archived"
  );
  const message = result.setupError ?? result.queryError;

  return (
    <main className="bg-stonepaper pb-10 pt-14">
      {message ? <SupabaseSetupNotice message={message} /> : null}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[11px] font-bold uppercase tracking-label text-muted">
          АРХИВ ДРОПОВ
        </p>
        <h1 className="mt-3 text-[18vw] font-black uppercase leading-[0.78] tracking-tight sm:text-8xl">
          DROPS
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
          Здесь живут опубликованные и архивные релизы. Черновики и запланированные
          дропы остаются внутри админки до публикации.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid gap-3">
          {drops.map((drop) => (
            <Link
              key={drop.id}
              href={`/drops/${drop.slug}`}
              className="grid gap-4 border border-line p-4 transition hover:bg-bone md:grid-cols-[9rem_1fr_auto]"
            >
              <div className="text-[11px] font-bold uppercase tracking-label text-muted">
                DROP {drop.dropNumber}
                <br />
                {drop.season}
                <br />
                {formatDateRu(drop.releaseDate)}
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tight">
                  {drop.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  {drop.description}
                </p>
              </div>
              <div className="self-start border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-label text-muted">
                {drop.status === "live" ? "LIVE" : "ARCHIVE"}
              </div>
            </Link>
          ))}
          {drops.length === 0 ? (
            <div className="border border-line p-4 text-sm text-muted">
              Пока нет опубликованных или архивных дропов.
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}
