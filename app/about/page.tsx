import Image from "next/image";
import { Footer } from "@/components/footer";
import { Principles } from "@/components/principles";
import { Stats } from "@/components/stats";
import { principles } from "@/data/qoru";
import { BRAND_NAME } from "@/lib/brand";

export default function AboutPage() {
  return (
    <main className="bg-stonepaper pb-10 pt-24">
      <section className="mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-bold uppercase tracking-label text-muted">
          О БРЕНДЕ
        </p>
        <h1 className="mt-4 max-w-[10ch] text-[17vw] font-black uppercase leading-[0.78] tracking-tight sm:text-8xl md:text-9xl">
          МЫ ДЕЛАЕМ ОДЕЖДУ ИЗ ТИШИНЫ.
        </h1>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="relative aspect-[5/6] overflow-hidden border border-line bg-field md:aspect-[16/8]">
          <Image
            src="/images/lookbook.svg"
            alt={`${BRAND_NAME} brand image`}
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[0.8fr_1.2fr]">
        <p className="border-t border-line pt-4 text-[11px] font-bold uppercase tracking-label text-muted">
          ROOTS · STONE · SILENCE
        </p>
        <div className="space-y-6 text-lg leading-8 text-soot">
          <p>
            {BRAND_NAME} — независимый бренд одежды ограниченных серий. Каждый релиз —
            один сезон, одна капсула и тираж, который можно пересчитать.
          </p>
          <p>
            Мы работаем с кавказским наследием тихо: через силуэт, плотность
            материала, ощущение горного воздуха и уважение к ручной работе. Без
            громкой сувенирности и декоративного шума.
          </p>
          <p>
            Вещи {BRAND_NAME} не спорят за внимание. Они держат форму, живут долго и
            оставляют место человеку, который их носит.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Principles items={principles} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Stats />
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-12 md:grid-cols-[1.2fr_0.8fr]">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink md:aspect-[5/4]">
          <Image
            src="/images/fabric.svg"
            alt={`${BRAND_NAME} fabric`}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex min-h-80 flex-col justify-between border-y border-line py-5">
          <p className="text-[11px] font-bold uppercase tracking-label text-muted">
            МАЛЫЙ ТИРАЖ
          </p>
          <p className="text-4xl font-black uppercase leading-[0.9] tracking-tight">
            КАЖДАЯ ВЕЩЬ НУМЕРУЕТСЯ. КАЖДЫЙ ДРОП ЗАКАНЧИВАЕТСЯ.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
