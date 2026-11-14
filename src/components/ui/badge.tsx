import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "warning" | "info" | "success";
}

/**
 * Shadcn-UI standard Badge component
 * https://ui.shadcn.com/docs/components/base/badge
 */
function Badge({
  className = "",
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variantClasses: Record<string, string> = {
    default:
      "border-transparent bg-emerald-500 text-slate-950 shadow hover:bg-emerald-400 font-bold",
    secondary:
      "border-slate-800 bg-slate-800/90 text-slate-200 hover:bg-slate-700/80 hover:text-white",
    outline:
      "border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white",
    destructive:
      "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    warning:
      "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    info:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
  };

  const selectedVariantClass = variantClasses[variant] || variantClasses.default;

  return (
    <div
      className={`${baseClasses} ${selectedVariantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export { Badge };
