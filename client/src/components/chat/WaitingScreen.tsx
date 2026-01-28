import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function WaitingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <div className="relative mb-8">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary rounded-full blur-xl"
        />
        <div className="relative bg-white p-6 rounded-full shadow-lg border border-primary/10">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">
        Finding a connection...
      </h2>
      
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        Please wait while we connect you with someone. This usually takes less than a minute.
      </p>

      <motion.div 
        className="mt-12 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
      </motion.div>
    </div>
  );
}
