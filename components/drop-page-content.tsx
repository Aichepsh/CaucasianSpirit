import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Drop, Product } from "@/types/qoru";
import { ProductCard } from "@/components/product-card";
import { Stats } from "@/components/stats";
import { Footer } from "@/components/footer";
import { formatDateRu } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

export function DropPageContent({
  drop,
  products
}: {
  drop: Drop;
  products: Product[];
}) {
  return (
    <main className="bg-stonepaper pb-10 pt-14">
      <section className="relative min-h-[78vh] overflow-hidden">
        <Image
          src={drop.heroImageUrl}
          alt={drop.title}
          fill
          priority
          sizes="100vw"
          className="bg-field"
          style={{
            objectFit: drop.heroImageFit,
            objectPosition: `${drop.heroImagePositionX}% ${drop.heroImagePositionY}%`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/60" />
        <div className="relative z-10 flex min-h-[78vh] flex-col justify-between px-4 py-5 text-stonepaper">
          <div className="grid grid-cols-2 gap-3 text-[11px] font-bold uppercase tracking-label">
            <span>DROP {drop.dropNumber}</span>
            <span className="text-right">{drop.totalQuantity || 120} ШТ</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-label">
              {drop.season} · {formatDateRu(drop.releaseDate)}
            </p>
            <h1 className="mt-3 max-w-[10ch] text-[18vw] font-black uppercase leading-[0.78] tracking-tight sm:text-8xl">
              {drop.title}
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div className="border-t border-line pt-4 text-[11px] font-bold uppercase tracking-label text-muted">
            DROP {drop.dropNumber}
            <br />
            {drop.season}
            <br />
            {formatDateRu(drop.releaseDate)}
            <br />
            {drop.totalQuantity || 120} НОМЕРНЫХ ИЗДЕЛИЙ
          </div>
          <p className="text-2xl font-black uppercase leading-[1.02] tracking-tight md:text-4xl">
            {drop.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            ИЗДЕЛИЯ ДРОПА
          </p>
          <h2 className="mt-2 text-5xl font-black uppercase leading-[0.86] tracking-tight">
            {String(products.length).padStart(2, "0")} ВЕЩИ
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-12 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden border border-line bg-field">
          <Image
            src="/images/lookbook.svg"
            alt={`${BRAND_NAME} campaign`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex min-h-80 flex-col justify-between border border-line p-5">
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            КАМПЕЙН
          </p>
          <p className="text-4xl font-black uppercase leading-[0.9] tracking-tight">
            НЕ ПОКАЗЫВАТЬ СИЛУ. ДАТЬ ЕЙ ОСТАТЬСЯ В ФОРМЕ.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Stats />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link
          href="/drops"
          className="flex min-h-36 items-end justify-between bg-ink p-5 text-stonepaper"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-label text-stonepaper/65">
              АРХИВ
            </p>
            <h2 className="mt-4 text-5xl font-black uppercase leading-[0.86] tracking-tight">
              ВСЕ ДРОПЫ
            </h2>
          </div>
          <ArrowRight size={28} strokeWidth={1.5} />
        </Link>
      </section>
      <Footer />
    </main>
  );
}
