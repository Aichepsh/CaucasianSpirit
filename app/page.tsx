import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { fallbackDrop, principles } from "@/data/qoru";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Principles } from "@/components/principles";
import { Stats } from "@/components/stats";
import { Footer } from "@/components/footer";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { getProducts } from "@/lib/db/products";
import { getCurrentDrop } from "@/lib/db/drops";
import { BRAND_NAME } from "@/lib/brand";

export default async function HomePage() {
  const productResult = await getProducts();
  const dropResult = await getCurrentDrop();
  const currentDrop = dropResult.drops[0] ?? fallbackDrop;
  const activeDropProducts = productResult.products.filter(
    (product) => product.dropId === currentDrop.id
  );
  const featuredRaw = productResult.products.filter((product) => product.isFeatured);
  const releaseProducts =
    activeDropProducts.length > 0
      ? activeDropProducts
      : featuredRaw.length > 0
        ? featuredRaw
        : productResult.products.slice(0, 4);
  const pageMessage =
    productResult.setupError ??
    productResult.queryError ??
    dropResult.setupError ??
    dropResult.queryError;

  return (
    <main className="bg-stonepaper">
      {pageMessage ? <SupabaseSetupNotice message={pageMessage} /> : null}
      <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden pt-14">
        <Image
          src={currentDrop.heroImageUrl}
          alt={`Кампания ${BRAND_NAME}`}
          fill
          priority
          sizes="100vw"
          className="bg-field"
          style={{
            objectFit: currentDrop.heroImageFit,
            objectPosition: `${currentDrop.heroImagePositionX}% ${currentDrop.heroImagePositionY}%`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/50" />
        <div className="relative z-10 flex min-h-[calc(100vh-3.5rem)] flex-col justify-between px-4 pb-0 pt-4 text-stonepaper">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-label">
            <span>
              {currentDrop.season
                ? `DROP ${currentDrop.dropNumber} / ${currentDrop.season}`
                : `DROP ${currentDrop.dropNumber}`}
            </span>
            <span>{currentDrop.totalQuantity || 120} ШТ</span>
          </div>

          <div className="pb-28 md:pb-16">
            <h1 className="max-w-[11ch] text-[18vw] font-black uppercase leading-[0.78] tracking-tight sm:text-8xl">
              {currentDrop.title}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-stonepaper/85">
              {currentDrop.description}
            </p>
            <Link
              href="/drop"
              className="mt-6 inline-flex h-12 items-center border border-stonepaper bg-stonepaper px-5 text-xs font-bold uppercase tracking-label text-ink"
            >
              Открыть коллекцию
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 z-20 flex h-10 w-screen -translate-x-1/2 items-center overflow-hidden border-y border-stonepaper/25 bg-ink text-stonepaper">
          <div className="hero-marquee flex min-w-max whitespace-nowrap text-[11px] font-bold uppercase tracking-label will-change-transform">
            {Array.from({ length: 2 }).map((_, groupIndex) => (
              <span key={groupIndex} className="pr-8">
                {Array.from({ length: 4 }).map((__, index) => (
                  <span key={index}>
                    ЛИМИТИРОВАННАЯ СЕРИЯ · {currentDrop.totalQuantity || 120} НОМЕРНЫХ
                    ИЗДЕЛИЙ · DROP {currentDrop.dropNumber} · {currentDrop.title} · {currentDrop.season || ""} ·{" "}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-label text-muted">
              01 — РЕЛИЗ
            </p>
            <h2 className="mt-2 text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-7xl">
              НОВЫЙ ДРОП
            </h2>
          </div>
          <Link
            href="/catalog"
            className="pb-1 text-xs font-bold uppercase tracking-label"
          >
            ВСЕ →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
          {releaseProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-[11px] font-bold uppercase tracking-label text-muted">
          02 — ИДЕЯ
        </p>
        <h2 className="mt-3 max-w-[9ch] text-6xl font-black uppercase leading-[0.82] tracking-tight sm:text-8xl">
          ГОРЫ НЕ КРИЧАТ.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-7 text-soot">
          {BRAND_NAME} — независимый бренд, рожденный между камнем и туманом. Мы
          делаем одежду тихой силы: плотные ткани, чистые линии, деликатные
          отсылки к культуре, которая нас вырастила.
        </p>
        <Link
          href="/about"
          className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-label"
        >
          О бренде <ArrowUpRight size={16} strokeWidth={1.5} />
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading eyebrow="03 — MOOD" title="LOOKBOOK" meta={currentDrop.season || ""} />
        <div className="relative aspect-[5/6] overflow-hidden border border-line bg-field md:aspect-[16/9]">
          <Image
            src="/images/lookbook.svg"
            alt={`Lookbook ${BRAND_NAME}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading eyebrow="04 — ПРИНЦИПЫ" title="ТИХАЯ СИЛА" />
        <Principles items={principles} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink md:aspect-[16/7]">
          <Image
            src="/images/fabric.svg"
            alt={`Материал ${BRAND_NAME}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-5 text-stonepaper">
            <p className="text-[11px] font-bold uppercase tracking-label">
              КАСПИЙ — МОСКВА
            </p>
            <p className="max-w-[15ch] text-4xl font-black uppercase leading-[0.88] tracking-tight">
              СОЗДАНО МЕЖДУ КАМНЕМ И ТУМАНОМ
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Stats />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link
          href="/catalog"
          className="flex min-h-40 items-end justify-between bg-ink p-5 text-stonepaper"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-label text-stonepaper/65">
              КАТАЛОГ
            </p>
            <h2 className="mt-4 max-w-[9ch] text-5xl font-black uppercase leading-[0.86] tracking-tight">
              ВЫБРАТЬ ИЗДЕЛИЕ
            </h2>
          </div>
          <ArrowRight size={28} strokeWidth={1.5} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
