import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoomList } from "@/components/chat/RoomList";
import { CreateRoomDialog } from "@/components/chat/CreateRoomDialog";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function GroupSessions() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-display text-foreground">Active Group Sessions</h2>
                        <p className="text-muted-foreground">Join a live support group or topic that resonates with you.</p>
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
        </DashboardLayout>
    );
}
