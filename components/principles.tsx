import type { Principle } from "@/types/qoru";

type PrinciplesProps = {
  items: Principle[];
};

export function Principles({ items }: PrinciplesProps) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <div
          key={item.number}
          className="grid grid-cols-[3.25rem_1fr] gap-3 border-b border-line py-5"
        >
          <span className="text-xs font-bold uppercase tracking-label text-muted">
            {item.number}
          </span>
          <div>
            <h3 className="text-lg font-black uppercase leading-none tracking-tight">
              {item.title}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
