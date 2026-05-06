"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/qoru";
import { formatEdition, formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const coverImageUrl = product.cardImageUrl || product.mainImageUrl;
  const gallery =
    product.media.length > 0
      ? product.media
      : [
          {
            id: "main",
            productId: product.id,
            url: product.mainImageUrl,
            path: "",
            alt: product.subtitle,
            sortOrder: 0,
            isMain: true
          }
        ];
  const galleryWithCover =
    coverImageUrl && !gallery.some((item) => item.url === coverImageUrl)
      ? [
          {
            id: "card-cover",
            productId: product.id,
            url: coverImageUrl,
            path: "",
            alt: product.subtitle,
            sortOrder: -1,
            isMain: false
          },
          ...gallery
        ]
      : gallery;
  const mainIndex = Math.max(
    0,
    galleryWithCover.findIndex((item) => item.url === coverImageUrl) >= 0
      ? galleryWithCover.findIndex((item) => item.url === coverImageUrl)
      : galleryWithCover.findIndex((item) => item.isMain)
  );
  const [imageIndex, setImageIndex] = useState(mainIndex);
  const currentImage =
    galleryWithCover[imageIndex % galleryWithCover.length] ?? galleryWithCover[0];
  const hasGallery = galleryWithCover.length > 1;

  function shiftImage(direction: -1 | 1) {
    setImageIndex(
      (current) =>
        (current + direction + galleryWithCover.length) % galleryWithCover.length
    );
  }

  return (
    <article
      className="group grid min-h-[344px] grid-rows-[auto_1fr_auto] border-b border-line pb-4"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-field">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || product.subtitle}
          fill
          priority={priority}
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-[1.025]"
        />
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Открыть ${product.title}`}
          className="absolute inset-0 z-10"
        />
        {hasGallery ? (
          <>
            <button
              type="button"
              aria-label="Предыдущее фото"
              onClick={() => shiftImage(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-ink/20 bg-stonepaper/85 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Следующее фото"
              onClick={() => shiftImage(1)}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-ink/20 bg-stonepaper/85 opacity-0 transition group-hover:opacity-100"
            >
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>
            <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1">
              {galleryWithCover.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Показать фото ${index + 1}`}
                  onClick={() => setImageIndex(index)}
                  className={`h-1.5 w-1.5 border border-ink ${
                    index === imageIndex ? "bg-ink" : "bg-stonepaper/85"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
        <span className="absolute bottom-2 right-2 border border-ink/25 bg-stonepaper/90 px-2 py-1 text-[10px] font-bold uppercase tracking-tightlabel">
          {formatEdition(product.quantity, product.quantity)}
        </span>
      </div>
      <div className="pt-3">
        <div className="mb-2 flex h-5 items-center">
          <span className="border border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-label">
            {product.status}
          </span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="block line-clamp-2 min-h-10 text-[15px] font-black uppercase leading-[1.02] tracking-tight"
        >
          {product.title}
        </Link>
        <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-[1.35] text-muted">
          {product.subtitle}
        </p>
      </div>
      <p className="mt-3 text-sm font-black uppercase tracking-tight">
        {formatPrice(product.price)}
      </p>
    </article>
  );
}
