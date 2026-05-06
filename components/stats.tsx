const stats = [
  ["120", "ШТУК В ДРОПЕ"],
  ["04", "ИЗДЕЛИЯ В КАПСУЛЕ"],
  ["02", "ЦЕХА РУЧНОЙ СБОРКИ"]
];

export function Stats() {
  return (
    <div className="grid grid-cols-3 border-l border-t border-line">
      {stats.map(([value, label]) => (
        <div
          key={label}
          className="min-h-28 border-b border-r border-line p-3 sm:p-5"
        >
          <p className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            {value}
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase leading-4 tracking-label text-muted">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
