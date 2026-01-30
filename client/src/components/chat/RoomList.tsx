import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCKET_EVENTS } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface Room {
    id: string;
    title: string;
    genre: string;
    capacity: number;
    participants: string[];
}

export function RoomList() {
    const { socket, joinRoom } = useSocket();
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        if (!socket) return;

        // Initial fetch
        socket.emit("get_rooms");

        socket.on(SOCKET_EVENTS.ROOM_LIST, (updatedRooms: Room[]) => {
            setRooms(updatedRooms);
        });

        return () => {
            socket.off(SOCKET_EVENTS.ROOM_LIST);
        };
    }, [socket]);

    const genreColors: Record<string, string> = {
        sad: "bg-blue-100 text-blue-700",
        happy: "bg-yellow-100 text-yellow-700",
        anxious: "bg-orange-100 text-orange-700",
        lonely: "bg-indigo-100 text-indigo-700",
        excited: "bg-pink-100 text-pink-700",
        other: "bg-gray-100 text-gray-700",
    };

    if (rooms.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
                <p>No active sessions right now.</p>
                <p className="text-sm mt-1">Be the first to host one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
                {rooms.map((room) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                    >
                        <Card className="hover:shadow-md transition-shadow border-border/60 bg-white/50 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <Badge variant="secondary" className={`mb-2 hover:bg-opacity-80 transition-colors ${genreColors[room.genre] || genreColors.other}`}>
                                            {room.genre}
                                        </Badge>
                                        <CardTitle className="text-lg font-display leading-tight">{room.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{room.participants.length} / {room.capacity}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={room.participants.length >= room.capacity ? "secondary" : "default"}
                                    disabled={room.participants.length >= room.capacity}
                                    onClick={() => joinRoom(room.id)}
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    {room.participants.length >= room.capacity ? "Full" : "Join Session"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}