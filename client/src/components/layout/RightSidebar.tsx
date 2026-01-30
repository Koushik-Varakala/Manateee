import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RightSidebar() {
    const recommendedTherapists = [
        { id: 1, name: "Dr. Sarah Mitchell", specialty: "Anxiety & Stress", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
        { id: 2, name: "Mark Wilson", specialty: "Trauma Recovery", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" },
        { id: 3, name: "Emily Chen", specialty: "Family Therapy", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200" },
    ];

    return (
        <div className="hidden xl:flex flex-col w-80 h-screen sticky top-0 p-6 border-l border-border/40 bg-secondary/10 backdrop-blur-md">
            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Find a Therapist"
                    className="pl-10 bg-white/50 border-transparent focus:bg-white transition-all shadow-sm rounded-xl"
                />
            </div>

            {/* Recommended List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-foreground">Recommended</h3>
                    <Button variant="ghost" className="text-primary text-xs p-0 h-auto hover:bg-transparent hover:underline">View All</Button>
                </div>

                <div className="space-y-4">
                    {recommendedTherapists.map((therapist) => (
                        <div key={therapist.id} className="flex items-center gap-3 p-3 bg-white/40 hover:bg-white rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-border/50 shadow-sm">
                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                <AvatarImage src={therapist.image} alt={therapist.name} />
                                <AvatarFallback>{therapist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">{therapist.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">{therapist.specialty}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Quote / Promo */}
            <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-50 border border-indigo-100/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <h4 className="font-semibold text-indigo-900 mb-2 relative z-10">Need extended support?</h4>
                <p className="text-sm text-indigo-700/80 mb-4 relative z-10">Book a session with a verified specialist today.</p>
                <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 shadow-sm">Book Now</Button>
            </div>
        </div>
    );
}
