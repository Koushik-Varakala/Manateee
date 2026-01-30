import { Link, useLocation } from "wouter";
import {
    MessageCircle,
    Users,
    RefreshCw,
    Music,
    Settings,
    LogOut,
    User,
    Shield,
    Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const [location] = useLocation();
    const { user, logoutMutation } = useAuth();

    const menuItems = [
        { icon: MessageCircle, label: "1-1 Chat", href: "/chat" },
        { icon: Home, label: "Home", href: "/" },
        { icon: Users, label: "Group Session", href: "/groups" }, // Placeholder route
        { icon: RefreshCw, label: "Recovery", href: "/recovery" },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-secondary/30 backdrop-blur-xl border-r border-border/40 p-6">
            {/* Brand */}
            {/* Brand */}
            <Link href="/">
                <div className="flex items-center gap-3 mb-10 pl-2 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center overflow-hidden shrink-0">
                        <img src="/manatee-logo.png" alt="Manateee" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
                        Manateee
                    </h1>
                </div>
            </Link>

            {/* Navigation */}
            <div className="space-y-2 flex-1">
                {menuItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-12 text-base font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-white shadow-sm text-primary hover:bg-white hover:text-primary"
                                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}

                {/* External Link: Moodist */}
                <a href="/moodist" target="_self" className="block mt-6">
                    <div className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer">
                        <Music className="w-4 h-4" />
                        <span className="font-semibold text-sm">Open Moodist</span>
                    </div>
                </a>
            </div>

            {/* User Profile / Footer */}
            <div className="mt-auto pt-6 border-t border-border/40">
                {user ? (
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.username}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.isGuest ? 'Guest' : 'Member'}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => logoutMutation.mutate()}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Link href="/auth">
                        <Button variant="outline" className="w-full justify-start gap-3">
                            <User className="w-4 h-4" />
                            Login
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
