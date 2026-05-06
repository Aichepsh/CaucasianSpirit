import { Footer } from "@/components/footer";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { DropsArchiveClient } from "@/components/drops-archive-client";
import { getDrops } from "@/lib/db/drops";
import { getProducts } from "@/lib/db/products";
import { getSiteSettings } from "@/lib/db/site-settings";

export default async function DropsArchivePage() {
  const [dropResult, productResult, settingsResult] = await Promise.all([
    getDrops(),
    getProducts(),
    getSiteSettings()
  ]);
  const activeDropId = settingsResult.settings.activeDropId;
  const drops = dropResult.drops.filter(
    (drop) =>
      drop.status === "archived" &&
      !drop.isActive &&
      (!activeDropId || drop.id !== activeDropId)
  );
  const message =
    dropResult.setupError ??
    dropResult.queryError ??
    productResult.setupError ??
    productResult.queryError ??
    settingsResult.setupError ??
    settingsResult.queryError;

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
          Здесь живут завершенные релизы. Текущий дроп, черновики и
          запланированные релизы остаются вне архива.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <DropsArchiveClient drops={drops} products={productResult.products} />
      </section>
      <Footer />
    </main>
  );
}
