import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface BadgeProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  children?: React.ReactNode;
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    neutral: "bg-white/5 text-gray-300 border-white/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
