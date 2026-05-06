"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Главная", href: "/" },
  { label: "Каталог", href: "/catalog" },
  { label: "Дроп", href: "/drop" },
  { label: "Бренд", href: "/about" }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-stonepaper/95 pb-[max(env(safe-area-inset-bottom),0px)] backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-4">
        {nav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center text-[10px] font-bold uppercase tracking-label text-muted"
            >
              <span
                className={cn(
                  "absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 bg-transparent",
                  active && "bg-ink"
                )}
              />
              <span className={cn(active && "text-ink")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
