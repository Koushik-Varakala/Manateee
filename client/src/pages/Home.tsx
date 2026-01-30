import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { IntentCard } from "@/components/chat/IntentCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { WaitingScreen } from "@/components/chat/WaitingScreen";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Ear, HeartHandshake, ShieldAlert, Play, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { joinQueue, state, sessionId } = useSocket();
  const { user } = useAuth();
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

  // Sample Feed Data
  const feedItems = [
    { id: 1, name: "Lideo Daw", role: "Psychologist", title: "Managing Anxiety", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400", time: "10m ago" },
    { id: 2, name: "Video Treapist", role: "Therapist", title: "Understanding Trauma", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400", time: "2h ago" },
    { id: 3, name: "Lide May", role: "Counselor", title: "Daily Mindfulness", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400", time: "5h ago" },
  ];

  const blogItems = [
    { id: 1, name: "Hamen Jaw", role: "Mental Health Advocate", title: "The Power of Listening", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Harpion Srapiesr", role: "Recovery Coach", title: "Steps to Sobriety", image: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Quick Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">Quick Section</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="destructive"
              className="h-14 rounded-2xl shadow-sm hover:shadow-md transition-all text-base border-2 border-red-200"
              onClick={() => joinQueue('talk')}
            >
              <ShieldAlert className="w-5 h-5 mr-2" /> SOS
            </Button>

            <Button
              variant="secondary"
              className="h-14 rounded-2xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-2 border-emerald-200 shadow-sm transition-all text-base"
              onClick={() => joinQueue('talk')}
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Talk
            </Button>

            <Button
              variant="outline"
              className="h-14 rounded-2xl hover:bg-secondary/50 border-2 transition-all text-base"
              onClick={() => joinQueue('listen')}
            >
              <Ear className="w-5 h-5 mr-2" /> Listen
            </Button>

            <Button
              variant="outline"
              className="h-14 rounded-2xl hover:bg-secondary/50 border-2 transition-all text-base dashed"
              onClick={() => joinQueue('both')}
            >
              <HeartHandshake className="w-5 h-5 mr-2" /> Both
            </Button>
          </div>
        </section>

        {/* Therapist Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">Therapist Feed</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all group">
                <div className="aspect-video relative overflow-hidden bg-secondary/10">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 text-primary ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-white/90 text-foreground hover:bg-white text-xs font-normal backdrop-blur-sm">
                    2m
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{item.role}</p>
                  <h4 className="font-medium text-sm text-foreground/80 line-clamp-2 leading-relaxed">{item.title}</h4>
                </CardContent>
                <div className="px-4 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Play className="w-3 h-3 text-emerald-600 ml-0.5" />
                    </div>
                    <span className="text-xs text-muted-foreground">Watch</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Blogs / Articles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">Blogs.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all group">
                <div className="aspect-[4/3] relative overflow-hidden bg-secondary/10">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-2 right-2 bg-white/90 text-foreground hover:bg-white text-xs font-normal backdrop-blur-sm">
                    Article
                  </Badge>
                </div>
                <CardContent className="p-4 pb-6">
                  <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{item.role}</p>
                  <h4 className="font-medium text-sm text-foreground/80">{item.title}</h4>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed border-2 bg-secondary/5 flex flex-col items-center justify-center p-8 gap-4 hover:bg-secondary/10 transition-colors cursor-pointer text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">See More</h3>
                <p className="text-xs text-muted-foreground">Browse all articles</p>
              </div>
            </Card>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
