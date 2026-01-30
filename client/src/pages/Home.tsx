import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { IntentCard } from "@/components/chat/IntentCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { WaitingScreen } from "@/components/chat/WaitingScreen";
import { RoomList } from "@/components/chat/RoomList";
import { CreateRoomDialog } from "@/components/chat/CreateRoomDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Ear, HeartHandshake, Users, Lock, LogOut, RefreshCw, ShieldAlert, Music } from "lucide-react";

export default function Home() {
  const { joinQueue, state, sessionId } = useSocket();
  const { user, logoutMutation } = useAuth();
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
    <div className="min-h-screen w-full bg-background transition-colors duration-500">
      {/* Decorative Background Elements */}
      {/* Decorative Background Elements - Cool Ocean & Lavender */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <header className="relative z-10 w-full p-4 flex justify-end gap-2">
        <a href="/moodist">
          <Button variant="secondary" size="sm" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
            <Music className="w-3 h-3 mr-2" /> Open Moodist
          </Button>
        </a>
        {!user ? (
          <Link href="/auth">
            <Button variant="outline" size="sm">
              <Lock className="w-3 h-3 mr-2" /> Login
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium mr-2">
              Hi, {user.isGuest ? 'Guest' : user.username}
            </div>
            <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()}>
              <LogOut className="w-3 h-3 mr-2" />
              Logout
            </Button>
          </div>
        )}
        <Button variant="destructive" size="sm" className="ml-2 shadow-lg animate-pulse" onClick={() => joinQueue('talk')}>
          <ShieldAlert className="w-4 h-4 mr-2" /> SOS
        </Button>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm tracking-wide mb-4">
            ANONYMOUS PEER SUPPORT
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display text-foreground tracking-tight">
            Manateee
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A safe, anonymous space to share your thoughts or lend a listening ear.
            No sign-up required.
          </p>
        </motion.div>

        <Tabs defaultValue="1-1" className="max-w-5xl mx-auto">
          <TabsList className="bg-background/50 backdrop-blur-md p-1.5 rounded-full border border-border shadow-sm mb-12 flex justify-center gap-2 h-auto w-full md:w-auto max-w-3xl mx-auto">
            <TabsTrigger
              value="1-1"
              className="flex-1 rounded-full px-6 py-3 text-base md:text-lg font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2.5"
            >
              <MessageCircle className="w-5 h-5" />
              1-on-1 Chat
            </TabsTrigger>
            <TabsTrigger
              value="group"
              className="flex-1 rounded-full px-6 py-3 text-base md:text-lg font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2.5"
            >
              <Users className="w-5 h-5" />
              Group Sessions
            </TabsTrigger>
            <TabsTrigger
              value="recovery"
              className="flex-1 rounded-full px-6 py-3 text-base md:text-lg font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2.5"
            >
              <RefreshCw className="w-5 h-5" />
              Recovery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1-1">
            {/* ... existing 1-1 content ... */}
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
          </TabsContent>

          <TabsContent value="group">
            {/* ... existing group content ... */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold font-display">Active Sessions</h2>
                  <p className="text-muted-foreground">Join a topic that resonates with you.</p>
                </div>
                {user && !user.isGuest ? (
                  <CreateRoomDialog />
                ) : (
                  <Link href="/auth">
                    <Button variant="outline" className="gap-2">
                      <Lock className="w-4 h-4" />
                      Login to Host
                    </Button>
                  </Link>
                )}
              </div>
              <RoomList />
            </div>
          </TabsContent>

          <TabsContent value="recovery">
            <div className="text-center space-y-8 py-12">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold text-primary">Community Recovery Model</h2>
                <p className="text-lg text-muted-foreground">
                  An anonymous safe haven for addiction recovery, based on the principle that one addict helping another is without parallel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {user?.isGuest ? (
                  <Card className="col-span-1 md:col-span-2 border-destructive/20 bg-destructive/5">
                    <CardContent className="p-8 text-center space-y-4">
                      <Lock className="w-12 h-12 text-destructive/80 mx-auto" />
                      <h3 className="text-xl font-semibold">Member Only Area</h3>
                      <p className="text-muted-foreground">Please log in to access the Recovery Dashboard, track your progress, and earn badges.</p>
                      <Link href="/auth">
                        <Button variant="default">Login / Sign Up</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="group hover:scale-[1.02] transition-all duration-300 border-accent/20 bg-accent/5 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-accent/10" onClick={() => setLocation("/recovery")}>
                    <CardContent className="p-8 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-accent/20 group-hover:bg-accent/30 transition-colors flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-7 h-7 text-accent-foreground group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <h3 className="text-xl font-semibold">My Recovery Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Track your sobriety, manage your 12-step progress, and view your milestones.</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="group hover:scale-[1.02] transition-all duration-300 border-primary/20 bg-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-8 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Sponsorship Program</h3>
                    <p className="text-sm text-muted-foreground">Connect with a Sponsor or become one. Service is the heart of recovery.</p>
                    <Button className="w-full" variant="secondary" onClick={() => joinQueue('sponsor')}>
                      <HeartHandshake className="w-4 h-4 mr-2" /> Find a Sponsor
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 mb-12 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="outline" className="bg-white/50 px-3 py-1 border-indigo-200 text-indigo-600">
              NEW: MENTI PROFESSIONAL
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-indigo-900">
              Need professional guidance?
            </h2>
            <p className="text-lg text-indigo-700/80 leading-relaxed">
              Sometimes peer support isn't enough. We've launched a verified therapist directory where you can find licensed professionals, watch educational content, and book structured sessions.
            </p>
            <div className="pt-4">
              <Link href="/therapists">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 text-lg shadow-lg shadow-indigo-200">
                  Find a Therapist <Users className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

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
