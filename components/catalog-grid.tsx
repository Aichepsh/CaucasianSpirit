"use client";

import { useMemo, useState } from "react";
import { categoryLabels } from "@/data/qoru";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/qoru";

const filters = ["all", "hoodies", "longsleeves", "t-shirts", "jackets"] as const;

type CatalogGridProps = {
  products: Product[];
};

export function CatalogGrid({ products }: CatalogGridProps) {
  const [active, setActive] = useState<(typeof filters)[number]>("all");

  const filteredProducts = useMemo(() => {
    if (active === "all") return products;
    return products.filter((product) => product.category === active);
  }, [active, products]);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={cn(
              "h-9 shrink-0 border px-3 text-[11px] font-bold uppercase tracking-label transition-colors",
              active === filter
                ? "border-ink bg-ink text-stonepaper"
                : "border-ink/25 text-ink"
            )}
          >
            {categoryLabels[filter]}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 2}
          />
        ))}
      </div>
    </>
  );
}
