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
}

interface SocketContextType {
  socket: Socket | null;
  state: AppState;
  messages: ChatMessage[];
  partnerRole: string | null;
  sessionId: string | null;
  joinQueue: (intent: Intent) => void;
  sendMessage: (content: string) => void;
  leaveSession: () => void;
  resetSession: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partnerRole, setPartnerRole] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
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
      setPartnerRole(payload.role === 'listener' ? 'Talker' : payload.role === 'talker' ? 'Listener' : 'Peer');
      setState('MATCHED');
      
      setTimeout(() => setState('ACTIVE'), 1000);
      
      setMessages([{
        id: 'system-start',
        sender: 'system',
        content: `You are connected with a ${payload.role === 'listener' ? 'Talker' : payload.role === 'talker' ? 'Listener' : 'Peer'}. Say hello!`,
        timestamp: new Date()
      }]);
    });

    socket.on(SOCKET_EVENTS.MESSAGE, (payload: MessagePayload) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: 'partner',
        content: payload.content,
        timestamp: new Date()
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
    socketRef.current.emit(SOCKET_EVENTS.LEAVE_SESSION);
    setState('ENDED');
  }, []);

  const resetSession = useCallback(() => {
    setState('IDLE');
    setMessages([]);
    setPartnerRole(null);
    setSessionId(null);
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      state,
      messages,
      partnerRole,
      sessionId,
      joinQueue,
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
