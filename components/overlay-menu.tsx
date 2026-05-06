"use client";

import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Drop, SiteSettings } from "@/types/qoru";

type OverlayMenuProps = {
  currentDrop: Drop;
  settings: SiteSettings;
  open: boolean;
  onClose: () => void;
};

export function OverlayMenu({ currentDrop, settings, open, onClose }: OverlayMenuProps) {
  const menuItems = [
    { label: "ГЛАВНАЯ", href: "/" },
    { label: "КАТАЛОГ", href: "/catalog" },
    { label: `ДРОП · ${currentDrop.title}`, href: "/drop" },
    { label: "АРХИВ ДРОПОВ", href: "/drops" },
    { label: "О БРЕНДЕ", href: "/about" },
    { label: "INSTAGRAM", href: settings.instagramUrl, external: true },
    { label: "TELEGRAM", href: settings.telegramUrl, external: true },
    { label: "ADMIN PANEL", href: "/admin" }
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-stonepaper transition duration-300",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      )}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col px-4 pb-8 pt-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="text-base font-black uppercase tracking-[0.08em]"
          >
            {settings.brandName}
          </Link>
          <button
            aria-label="Закрыть меню"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <p className="mt-12 text-[11px] font-bold uppercase tracking-label text-muted">
          НАВИГАЦИЯ
        </p>
        <div className="mt-5 border-t border-line">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              target={item.external ? "_blank" : undefined}
              className="flex min-h-16 items-center justify-between border-b border-line py-4 text-[25px] font-black uppercase leading-none tracking-tight"
            >
              <span>{item.label}</span>
              {item.external ? <ArrowUpRight size={21} strokeWidth={1.5} /> : null}
            </Link>
          ))}
        </div>

        <div className="mt-auto border-t border-line pt-4 text-[11px] font-bold uppercase tracking-label text-muted">
          {`DROP ${currentDrop.dropNumber}`}
          {currentDrop.season ? ` · ${currentDrop.season}` : ""}
          {` · LIMITED ${currentDrop.totalQuantity}`}
        </div>
      </div>
    </div>
  );
}
