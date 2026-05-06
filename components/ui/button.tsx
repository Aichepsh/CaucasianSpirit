import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center border px-4 text-xs font-bold uppercase tracking-label transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "border-ink bg-ink text-stonepaper hover:bg-soot",
        variant === "outline" &&
          "border-ink/35 bg-transparent text-ink hover:border-ink",
        variant === "ghost" &&
          "border-transparent bg-transparent text-ink hover:bg-field",
        variant === "danger" &&
          "border-danger bg-danger text-stonepaper hover:bg-danger/90",
        className
      )}
      {...props}
    />
  );
}
