import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import {
  SOCKET_EVENTS,
  type Intent,
  type MessagePayload,
  type MatchPayload
} from '@shared/schema';

export type AppState = 'IDLE' | 'WAITING' | 'MATCHED' | 'ACTIVE' | 'ENDED';

interface ChatMessage {
  id: string;
  sender: 'me' | 'partner' | 'system';
  content: string;
  timestamp: Date;
  senderId?: string;
  senderName?: string;
}

interface SocketContextType {
  socket: Socket | null;
  state: AppState;
  messages: ChatMessage[];
  partnerRole: string | null;
  partnerSocketId: string | null;
  roomTitle: string | null;
  sessionId: string | null;
  joinQueue: (intent: Intent) => void;
  createRoom: (title: string, genre: string, capacity: number) => void;
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
  leaveSession: () => void;
  resetSession: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partnerRole, setPartnerRole] = useState<string | null>(null);
  const [partnerSocketId, setPartnerSocketId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roomTitle, setRoomTitle] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Connect to the same host
    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to socket server');
    });

    socket.on(SOCKET_EVENTS.MATCH_FOUND, (payload: MatchPayload) => {
      setSessionId(payload.sessionId);
      setPartnerSocketId(payload.partnerSocketId || null);
      setPartnerRole(payload.role === 'listener' ? 'Talker' : payload.role === 'talker' ? 'Listener' : 'Peer');
      setRoomTitle(null);
      setState('MATCHED');

      setTimeout(() => setState('ACTIVE'), 1000);

      setMessages([{
        id: 'system-start',
        sender: 'system',
        content: `You are connected with a ${payload.role === 'listener' ? 'Talker' : payload.role === 'talker' ? 'Listener' : 'Peer'}. Say hello!`,
        timestamp: new Date()
      }]);
    });

    // Handle Group Room Joined
    socket.on("room_joined", (payload: { roomId: string, room: any }) => {
      setSessionId(payload.roomId);
      setPartnerRole('Group');
      setRoomTitle(payload.room.title);
      setState('ACTIVE');
      setMessages([{
        id: 'system-room',
        sender: 'system',
        content: `Joined room: ${payload.room.title}`,
        timestamp: new Date()
      }]);
    });

    socket.on(SOCKET_EVENTS.MESSAGE, (payload: MessagePayload & { senderId: string, senderName?: string }) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: 'partner',
        content: payload.content,
        timestamp: new Date(),
        senderId: payload.senderId,
        senderName: payload.senderName
      }]);
    });

    socket.on(SOCKET_EVENTS.PARTNER_DISCONNECTED, () => {
      setState('ENDED');
      setMessages(prev => [...prev, {
        id: 'system-end',
        sender: 'system',
        content: 'Your partner has disconnected.',
        timestamp: new Date()
      }]);
    });

    socket.on(SOCKET_EVENTS.SESSION_ENDED, () => {
      if (state !== 'IDLE') {
        setState('ENDED');
      }
    });

    socket.on(SOCKET_EVENTS.ERROR, (err: { message: string }) => {
      toast({
        title: "Connection Error",
        description: err.message,
        variant: "destructive"
      });
      // Don't reset to IDLE on every error, but specific ones might need it
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  const joinQueue = useCallback((intent: Intent) => {
    if (!socketRef.current) return;
    setState('WAITING');
    socketRef.current.emit(SOCKET_EVENTS.JOIN_QUEUE, { intent });
  }, []);

  const createRoom = useCallback((title: string, genre: string, capacity: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.CREATE_ROOM, { title, genre, capacity });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !content.trim()) return;

    socketRef.current.emit(SOCKET_EVENTS.MESSAGE, { content });
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      sender: 'me',
      content,
      timestamp: new Date()
    }]);
  }, []);

  const leaveSession = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit(SOCKET_EVENTS.LEAVE_SESSION); // Or LEAVE_ROOM, logic in backend handles generic leave
    setState('ENDED');
  }, []);

  const resetSession = useCallback(() => {
    setState('IDLE');
    setMessages([]);
    setPartnerRole(null);
    setPartnerSocketId(null);
    setSessionId(null);
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      state,
      messages,
      partnerRole,
      partnerSocketId,
      roomTitle,
      sessionId,
      joinQueue,
      createRoom,
      joinRoom,
      sendMessage,
      leaveSession,
      resetSession
    }}>
      {children}
    </SocketContext.Provider>
  );
}

// Internal hook for consumption
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
