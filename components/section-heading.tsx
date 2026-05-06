type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  meta?: string;
};

export function SectionHeading({ eyebrow, title, meta }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-label text-muted">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-6xl">
          {title}
        </h2>
      </div>
      {meta ? (
        <p className="pb-1 text-xs font-bold uppercase tracking-label text-muted">
          {meta}
        </p>
      ) : null}
    </div>
  );
}
