"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { OverlayMenu } from "@/components/overlay-menu";
import { SearchOverlay } from "@/components/search-overlay";
import type { Drop, SiteSettings } from "@/types/qoru";

export function SiteShell({
  children,
  currentDrop,
  settings
}: {
  children: React.ReactNode;
  currentDrop: Drop;
  settings: SiteSettings;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Header
        brandName={settings.brandName}
        onMenuOpen={() => setMenuOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
      />
      {children}
      <BottomNav />
      <OverlayMenu
        currentDrop={currentDrop}
        settings={settings}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
