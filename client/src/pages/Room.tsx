import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useLocation } from "wouter";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, LogOut, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Room() {
  const { 
    state, 
    messages, 
    sendMessage, 
    leaveSession, 
    resetSession, 
    partnerRole, 
    sessionId 
  } = useSocket();
  
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Protect route - if no session, go home
  useEffect(() => {
    if (state === 'IDLE') {
      setLocation('/');
    }
  }, [state, setLocation]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLeave = () => {
    leaveSession();
    resetSession();
    setLocation('/');
  };

  const handleReturnHome = () => {
    resetSession();
    setLocation('/');
  };

  // If ended, show end screen overlay
  if (state === 'ENDED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-border"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Chat Ended</h2>
          <p className="text-muted-foreground mb-8">
            The session has been closed. We hope you found the conversation helpful.
          </p>
          <Button 
            onClick={handleReturnHome}
            className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Return Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b border-border/50 px-4 py-4 md:px-6 shadow-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">Anonymous Chat</h2>
              <p className="text-xs text-muted-foreground">
                Connected with <span className="font-medium text-primary">{partnerRole || 'Partner'}</span>
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Leave Chat</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End conversation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect you from your partner immediately. You cannot undo this action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeave} className="bg-destructive hover:bg-destructive/90">
                  End Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-4">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatBubble 
                  key={msg.id} 
                  content={msg.content} 
                  sender={msg.sender} 
                  timestamp={msg.timestamp}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-border/50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3 items-end"
          >
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full min-h-[56px] py-4 pl-5 pr-12 rounded-2xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-base shadow-inner"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="h-14 w-14 rounded-2xl shrink-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <Send className="w-6 h-6" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              Secure • Anonymous • Safe
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
