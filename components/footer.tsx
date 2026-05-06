import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFooterLinks } from "@/lib/db/footer";
import { getSiteSettings } from "@/lib/db/site-settings";

export async function Footer() {
  const { links, setupError, queryError } = await getFooterLinks();
  const settingsResult = await getSiteSettings();
  const message = setupError ?? queryError ?? settingsResult.setupError ?? settingsResult.queryError;
  const settings = settingsResult.settings;

  return (
    <footer className="border-t border-line bg-stonepaper px-4 pb-28 pt-10 md:pb-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-[10ch] text-[18vw] font-black uppercase leading-[0.78] tracking-tight md:text-[10rem]">
          {settings.brandName}
        </h2>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-label text-muted">
          {settings.footerMeta}
        </p>
        {message ? (
          <p className="mt-4 border border-ink/20 bg-bone px-3 py-2 text-[11px] leading-5 text-muted">
            {message}
          </p>
        ) : null}
        <div className="mt-8 border-t border-line">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : undefined}
              className="flex items-center justify-between border-b border-line py-4 text-sm font-bold uppercase tracking-tightlabel"
            >
              <span>{link.label}</span>
              <span className="flex items-center gap-2 text-muted">
                {link.url.startsWith("http")
                  ? link.url.replace(/^https?:\/\//, "")
                  : link.url}
                {link.url.startsWith("http") ? (
                  <ArrowUpRight size={16} strokeWidth={1.5} />
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
