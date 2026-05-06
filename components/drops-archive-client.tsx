"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Drop, Product } from "@/types/qoru";
import { formatDateRu, formatPrice } from "@/lib/utils";

type DropsArchiveClientProps = {
  drops: Drop[];
  products: Product[];
};

export function DropsArchiveClient({ drops, products }: DropsArchiveClientProps) {
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const selectedDrop = useMemo(
    () => drops.find((drop) => drop.id === selectedDropId) ?? null,
    [drops, selectedDropId]
  );
  const selectedProducts = useMemo(
    () =>
      selectedDrop
        ? products.filter((product) => product.dropId === selectedDrop.id)
        : [],
    [products, selectedDrop]
  );

  return (
    <>
      <div className="grid gap-3">
        {drops.map((drop) => {
          const count = products.filter((product) => product.dropId === drop.id).length;
          return (
            <button
              key={drop.id}
              type="button"
              onClick={() => setSelectedDropId(drop.id)}
              className="grid gap-4 border border-line p-4 text-left transition hover:border-ink hover:bg-bone focus-visible:border-ink focus-visible:outline-none md:grid-cols-[9rem_1fr_auto]"
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
              <div className="grid content-start gap-2">
                <span className="border border-line px-3 py-2 text-center text-[10px] font-bold uppercase tracking-label text-muted">
                  ARCHIVE
                </span>
                <span className="border border-line px-3 py-2 text-center text-[10px] font-bold uppercase tracking-label text-muted">
                  {count} моделей
                </span>
              </div>
            </button>
          );
        })}
        {drops.length === 0 ? (
          <div className="border border-line p-4 text-sm text-muted">
            В архиве пока нет завершенных дропов.
          </div>
        ) : null}
      </div>

      {selectedDrop ? (
        <div className="fixed inset-0 z-[60] bg-ink/45 p-3 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Закрыть архивный дроп"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedDropId(null)}
          />
          <section className="relative mx-auto flex max-h-[calc(100vh-1.5rem)] max-w-5xl flex-col overflow-hidden border border-ink bg-stonepaper shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-label text-muted">
                  DROP {selectedDrop.dropNumber} · {selectedDrop.season} · ARCHIVE
                </p>
                <h2 className="mt-1 text-3xl font-black uppercase leading-none tracking-tight">
                  {selectedDrop.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDropId(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-line"
                aria-label="Закрыть"
              >
                <X size={16} strokeWidth={1.7} />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <p className="max-w-2xl text-sm leading-6 text-muted">
                {selectedDrop.description}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {selectedProducts.map((product) => (
                  <article key={product.id} className="border-b border-line pb-4">
                    <div className="relative aspect-[4/5] overflow-hidden border border-line bg-field">
                      <Image
                        src={product.cardImageUrl || product.mainImageUrl}
                        alt={product.subtitle || product.title}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 right-2 border border-line bg-stonepaper/90 px-2 py-1 text-[10px] font-bold uppercase tracking-label">
                        {product.quantity} / {product.quantity}
                      </span>
                    </div>
                    <p className="mt-3 inline-flex border border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-label">
                      {product.status}
                    </p>
                    <h3 className="mt-2 min-h-10 text-sm font-black uppercase leading-tight">
                      {product.title}
                    </h3>
                    <p className="mt-1 min-h-8 text-xs leading-4 text-muted">
                      {product.subtitle}
                    </p>
                    <p className="mt-3 text-sm font-black uppercase">
                      {formatPrice(product.price)}
                    </p>
                  </article>
                ))}
              </div>
              {selectedProducts.length === 0 ? (
                <div className="mt-5 border border-line p-4 text-sm text-muted">
                  В этом дропе пока нет закрепленных моделей.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
