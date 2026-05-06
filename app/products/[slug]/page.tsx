import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Footer } from "@/components/footer";
import { formatPrice } from "@/lib/utils";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { getProductBySlug, getProducts } from "@/lib/db/products";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const productResult = await getProductBySlug(params.slug);
  const relatedResult = await getProducts();
  const product = productResult.products[0];

  if (!product) {
    notFound();
  }

  const others = relatedResult.products
    .filter((item) => item.id !== product.id)
    .slice(0, 2);
  const message =
    productResult.setupError ??
    productResult.queryError ??
    relatedResult.setupError ??
    relatedResult.queryError;

  return (
    <main className="bg-stonepaper pb-10 pt-14">
      {message ? <SupabaseSetupNotice message={message} /> : null}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-5 md:grid-cols-[1.15fr_0.85fr]">
        <ProductGallery
          title={product.subtitle}
          images={
            product.media.length > 0
              ? product.media.map((item) => item.url)
              : [product.mainImageUrl]
          }
          quantity={product.quantity}
        />

        <div className="md:sticky md:top-20 md:self-start">
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            {product.drop?.title ?? "DROP"} · {product.season}
          </p>
          <h1 className="mt-4 text-6xl font-black uppercase leading-[0.82] tracking-tight md:text-7xl">
            {product.title}
          </h1>
          <p className="mt-3 text-lg text-muted">{product.subtitle}</p>
          <div className="mt-5 flex items-center justify-between border-y border-line py-4">
            <span className="border border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-label">
              {product.status}
            </span>
            <span className="text-2xl font-black uppercase">
              {formatPrice(product.price)}
            </span>
          </div>

          <p className="mt-6 text-base leading-7 text-soot">{product.description}</p>

          <Link
            href={product.instagramUrl}
            target="_blank"
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-5 text-xs font-bold uppercase tracking-label text-stonepaper"
          >
            Написать в Instagram <ArrowUpRight size={16} strokeWidth={1.5} />
          </Link>

          <div className="mt-8 border-t border-line">
            {[
              ["Материал", product.material],
              ["Состав", product.composition],
              ["Тираж", product.editionLabel],
              ["Дроп", product.drop?.title ?? "—"],
              ["Сезон", product.season],
              ["Производство", product.productionNote]
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[7rem_1fr] gap-3 border-b border-line py-4 text-sm"
              >
                <span className="text-[11px] font-bold uppercase tracking-label text-muted">
                  {label}
                </span>
                <span className="leading-5">{value}</span>
              </div>
            ))}
          </div>

          <p className="mt-7 border-l border-ink pl-4 text-sm leading-6 text-muted">
            {product.description} Вещь не построена вокруг логотипа: внимание
            остается на ткани, объеме и тихой линии силуэта.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-label text-muted">
              СМОТРЕТЬ ЕЩЕ
            </p>
            <h2 className="mt-2 text-5xl font-black uppercase leading-[0.86] tracking-tight">
              ДРУГИЕ ИЗДЕЛИЯ
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
          {others.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
