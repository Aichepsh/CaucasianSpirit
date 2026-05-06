"use client";

import { useState } from "react";
import Image from "next/image";
import { formatEdition } from "@/lib/utils";

type ProductGalleryProps = {
  title: string;
  images: string[];
  quantity: number;
};

export function ProductGallery({
  title,
  images,
  quantity
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-field">
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 border border-ink/25 bg-stonepaper/90 px-2 py-1 text-[10px] font-bold uppercase tracking-tightlabel">
          {formatEdition(quantity, quantity)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            aria-label={`Показать изображение ${image}`}
            onClick={() => setActiveImage(image)}
            className="relative aspect-[4/5] border border-line bg-field data-[active=true]:border-ink"
            data-active={activeImage === image}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="25vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
