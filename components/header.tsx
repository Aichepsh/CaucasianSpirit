"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";

type HeaderProps = {
  brandName: string;
  onMenuOpen: () => void;
  onSearchOpen: () => void;
};

export function Header({ brandName, onMenuOpen, onSearchOpen }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-line bg-stonepaper/95 backdrop-blur">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[3.5rem_1fr_3.5rem] items-center px-1">
        <button
          aria-label="Открыть меню"
          onClick={onMenuOpen}
          className="flex h-14 items-center justify-center text-ink"
        >
          <Menu size={22} strokeWidth={1.6} />
        </button>
        <Link
          href="/"
          className="text-center text-[15px] font-black uppercase leading-none tracking-[0.08em] sm:text-[20px]"
        >
          {brandName}
        </Link>
        <button
          aria-label="Открыть поиск"
          onClick={onSearchOpen}
          className="flex h-14 items-center justify-center text-ink"
        >
          <Search size={21} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}
