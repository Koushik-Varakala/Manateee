import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatBubbleProps {
  content: string;
  sender: 'me' | 'partner' | 'system';
  timestamp: Date;
  senderName?: string;
}

export function ChatBubble({ content, sender, timestamp, senderName }: ChatBubbleProps) {
  if (sender === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <span className="bg-muted/50 text-muted-foreground px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase">
          {content}
        </span>
      </motion.div>
    );
  }

  const isMe = sender === 'me';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-4",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[80%] md:max-w-[70%] px-6 py-4 shadow-sm",
        isMe
          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
          : "bg-white text-foreground border border-border/50 rounded-2xl rounded-tl-sm"
      )}>
        {!isMe && senderName && (
          <p className="text-xs font-bold text-primary mb-1">{senderName}</p>
        )}
        <p className="text-base leading-relaxed whitespace-pre-wrap font-sans">
          {content}
        </p>
        <div className={cn(
          "text-[10px] mt-2 opacity-70",
          isMe ? "text-primary-foreground/80 text-right" : "text-muted-foreground text-left"
        )}>
          {format(timestamp, 'h:mm a')}
        </div>
      </div>
    </motion.div>
  );
}
