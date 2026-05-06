import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { fallbackDrop } from "@/data/qoru";
import { BRAND_NAME } from "@/lib/brand";
import { getCurrentDrop } from "@/lib/db/drops";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Limited Drop Fashion`,
  description: `${BRAND_NAME} premium editorial catalog for limited clothing drops.`
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dropResult = await getCurrentDrop();
  const settingsResult = await getSiteSettings();
  const currentDrop = dropResult.drops[0] ?? fallbackDrop;
  const settings = settingsResult.settings;

  return (
    <html lang="ru">
      <body className="font-sans antialiased">
        <SiteShell currentDrop={currentDrop} settings={settings}>{children}</SiteShell>
      </body>
    </html>
  );
}
