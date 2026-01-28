import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IntentCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
  disabled?: boolean;
}

export function IntentCard({ 
  title, 
  description, 
  icon: Icon, 
  colorClass,
  onClick,
  disabled 
}: IntentCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-start p-8 rounded-3xl transition-all duration-300",
        "bg-white border border-border/50 shadow-sm hover:shadow-xl",
        "text-left w-full h-full min-h-[200px] overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150",
        colorClass
      )} />
      
      <div className={cn(
        "p-4 rounded-2xl mb-6 transition-colors duration-300",
        "bg-secondary text-foreground group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-2xl font-bold mb-2 font-display text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-lg leading-relaxed font-sans">
        {description}
      </p>
    </motion.button>
  );
}
