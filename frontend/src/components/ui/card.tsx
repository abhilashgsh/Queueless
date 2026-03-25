import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  glass?: boolean;
  hover?: boolean;
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, hover = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
        className={cn(
          "rounded-2xl border p-6 transition-all duration-300",
          glass
            ? "bg-white/[0.03] backdrop-blur-xl border-white/[0.08]"
            : "bg-background border-border",
          hover && glass && "hover:bg-white/[0.05] hover:border-white/[0.15]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

export { Card };
