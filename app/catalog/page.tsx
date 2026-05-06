import { CatalogGrid } from "@/components/catalog-grid";
import { Footer } from "@/components/footer";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { fallbackDrop } from "@/data/qoru";
import { getCurrentDrop } from "@/lib/db/drops";
import { getProducts } from "@/lib/db/products";

export default async function CatalogPage() {
  const { products, setupError, queryError } = await getProducts();
  const dropResult = await getCurrentDrop();
  const currentDrop = dropResult.drops[0] ?? fallbackDrop;
  const message = setupError ?? queryError ?? dropResult.setupError ?? dropResult.queryError;

  return (
    <main className="bg-stonepaper px-4 pb-10 pt-24">
      {message ? <SupabaseSetupNotice message={message} /> : null}
      <section className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-label text-muted">
          КАТАЛОГ
        </p>
        <h1 className="mt-3 text-[18vw] font-black uppercase leading-[0.78] tracking-tight sm:text-8xl md:text-9xl">
          ВСЕ ИЗДЕЛИЯ
        </h1>
        <div className="mt-5 flex items-center justify-between border-y border-line py-3 text-[11px] font-bold uppercase tracking-label text-muted">
          <span>{products.length} позиций</span>
          <span>
            {currentDrop.season
              ? `Drop ${currentDrop.dropNumber} · ${currentDrop.season}`
              : `Drop ${currentDrop.dropNumber}`}
          </span>
        </div>
        <div className="mt-5">
          <CatalogGrid products={products} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
