"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { fallbackProducts } from "@/data/qoru";
import { fetchProductsClient } from "@/lib/db/admin-client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/qoru";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const quick = ["Hoodies", "Longsleeves", "T-Shirts", "Limited"];

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!open) return;

    fetchProductsClient()
      .then((rows) => {
        if (!active) return;
        setProducts(rows);
        setStatusMessage(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить поиск.";
        setStatusMessage(message);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) => {
      const haystack = [
        product.title,
        product.subtitle,
        product.category,
        product.status,
        product.drop?.title ?? ""
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, products]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-stonepaper transition duration-300",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-hidden={!open}
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 pb-8 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            ПОИСК
          </p>
          <button
            aria-label="Закрыть поиск"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <label className="mt-8 flex items-center border-b border-ink pb-2">
          <Search size={20} strokeWidth={1.5} />
          <Input
            autoFocus={open}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Худи, камень, limited..."
            className="h-12 border-0 bg-transparent px-3 text-2xl font-black uppercase placeholder:normal-case focus:border-0"
          />
        </label>

        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
          {quick.map((item) => (
            <Button
              key={item}
              variant="outline"
              className="h-9 shrink-0 px-3"
              onClick={() => setQuery(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="mt-8 border-t border-line">
          {statusMessage ? (
            <p className="py-3 text-xs leading-5 text-muted">{statusMessage}</p>
          ) : null}
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-line py-3"
            >
              <div className="relative aspect-[4/5] bg-field">
                <Image
                  src={product.cardImageUrl || product.mainImageUrl}
                  alt={product.subtitle}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-center">
                <p className="truncate text-sm font-black uppercase leading-none">
                  {product.title}
                </p>
                <p className="mt-1 text-xs text-muted">{product.subtitle}</p>
                <p className="mt-2 text-xs font-bold uppercase">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
          {results.length === 0 ? (
            <p className="py-8 text-sm text-muted">Ничего не найдено.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
