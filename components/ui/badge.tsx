import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-[var(--surface-muted)] text-[var(--text-muted)]",
        tone === "success" && "bg-[var(--success-soft)] text-[var(--success)]",
        tone === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)]",
        className,
      )}
      {...props}
    />
  );
}
