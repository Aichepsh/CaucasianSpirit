type SupabaseSetupNoticeProps = {
  message: string;
};

export function SupabaseSetupNotice({ message }: SupabaseSetupNoticeProps) {
  return (
    <div className="mx-auto mb-6 mt-16 max-w-6xl border border-ink/25 bg-bone px-4 py-3 text-sm leading-6 text-ink/80">
      {message || "Supabase не настроен. Добавьте переменные окружения."}
    </div>
  );
}
