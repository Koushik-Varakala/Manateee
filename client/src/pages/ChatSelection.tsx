import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IntentCard } from "@/components/chat/IntentCard";
import { MessageCircle, Ear, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { useSocket } from "@/hooks/use-socket";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { WaitingScreen } from "@/components/chat/WaitingScreen";

export default function ChatSelection() {
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
                <div className="w-full max-w-2xl bg-card/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-primary/5 border border-border p-8 md:p-12">
                    <WaitingScreen />
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-5xl mx-auto py-8">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl font-bold font-display text-foreground">1-on-1 Peer Support</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Connect anonymously with someone who understands. Choose how you'd like to participate today.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                >
                    <IntentCard
                        title="I want to talk"
                        description="Share what's on your mind with someone who will listen without judgment."
                        icon={MessageCircle}
                        colorClass="bg-blue-500"
                        onClick={() => joinQueue('talk')}
                    />
                    <IntentCard
                        title="I want to listen"
                        description="Provide a supportive ear to someone who needs to be heard right now."
                        icon={Ear}
                        colorClass="bg-indigo-400"
                        onClick={() => joinQueue('listen')}
                    />
                    <IntentCard
                        title="I'm open to both"
                        description="Connect with a peer for a balanced conversation of give and take."
                        icon={HeartHandshake}
                        colorClass="bg-sky-500"
                        onClick={() => joinQueue('both')}
                    />
                </motion.div>

                <div className="mt-12 p-6 rounded-2xl bg-secondary/20 border border-secondary/50 text-center">
                    <p className="text-sm text-muted-foreground">
                        All conversations are anonymous and private. By continuing, you agree to our <span className="underline cursor-pointer">Community Guidelines</span>.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
