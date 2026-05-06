import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full border border-ink/25 bg-bone px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-none border border-ink/25 bg-bone px-3 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink",
        className
      )}
      {...props}
    />
  );
}
