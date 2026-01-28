import { useSocket } from "@/hooks/use-socket";
import { IntentCard } from "@/components/chat/IntentCard";
import { MessageCircle, Ear, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { WaitingScreen } from "@/components/chat/WaitingScreen";

export default function Home() {
  const { joinQueue, state, sessionId } = useSocket();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (state === 'MATCHED' || state === 'ACTIVE') {
      if (sessionId) {
        setLocation(`/room/${sessionId}`);
      }
    }
  }, [state, sessionId, setLocation]);

  if (state === 'WAITING') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary/30 p-4">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-primary/5 border border-white p-8 md:p-12">
          <WaitingScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA]">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24 space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm tracking-wide mb-4">
            ANONYMOUS PEER SUPPORT
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display text-foreground tracking-tight">
            Menti
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A safe, anonymous space to share your thoughts or lend a listening ear. 
            No sign-up required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <IntentCard
              title="I want to talk"
              description="Share what's on your mind with someone who will listen without judgment."
              icon={MessageCircle}
              colorClass="bg-blue-500"
              onClick={() => joinQueue('talk')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <IntentCard
              title="I want to listen"
              description="Provide a supportive ear to someone who needs to be heard right now."
              icon={Ear}
              colorClass="bg-teal-500"
              onClick={() => joinQueue('listen')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <IntentCard
              title="I'm open to both"
              description="Connect with a peer for a balanced conversation of give and take."
              icon={HeartHandshake}
              colorClass="bg-purple-500"
              onClick={() => joinQueue('both')}
            />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center text-sm text-muted-foreground"
        >
          <p>By using Menti, you agree to be kind, respectful, and supportive.</p>
          <p className="mt-2">Emergency? Please call your local emergency number.</p>
        </motion.div>
      </div>
    </div>
  );
}
