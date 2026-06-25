import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Alert({
  className,
  children,
  tone = "danger",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "danger" | "warning" | "success";
}) {
  const toneStyles = {
    danger: "border-[color:var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]",
    warning: "border-[color:var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]",
    success: "border-[color:var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
  } as const;

  return (
    <div
      className={cn("flex gap-3 rounded-2xl border p-4", toneStyles[tone], className)}
      {...props}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-sm">{children}</div>
    </div>
  );
}
