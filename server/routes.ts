import type { Express } from "express";
import type { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { joinQueueSchema, messageSchema, SOCKET_EVENTS } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*", // Adjust for production if needed
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);
    
    // Create initial user state
    storage.createUser(socket.id);

    // --- Event Handlers ---

    socket.on(SOCKET_EVENTS.JOIN_QUEUE, (payload) => {
      try {
        const { intent } = joinQueueSchema.parse(payload);
        const user = storage.getUser(socket.id);
        
        if (!user || user.state !== 'IDLE') {
          // Can't join if not idle or doesn't exist (reconnect?)
          // For MENTI, we treat reconnect as new user mostly, but strict state check is good.
          return;
        }

        console.log(`User ${socket.id} joining queue with intent: ${intent}`);

        // Try to find a match immediately
        const match = storage.findMatch(socket.id, intent);

        if (match) {
          // --- Match Found! ---
          const { partnerId, role } = match;
          const partner = storage.getUser(partnerId);

          if (!partner) {
            // Edge case: Partner disconnected mid-check?
            // Fallback: Add self to queue
            storage.addToQueue(socket.id, intent);
            storage.updateUserState(socket.id, 'WAITING', { intent });
            socket.emit('state_update', { state: 'WAITING' });
            return;
          }

          // Remove partner from queue
          storage.removeFromQueue(partnerId);

          // Create Session ID
          const sessionId = randomUUID();

          // Update Self
          storage.updateUserState(socket.id, 'MATCHED', { 
            partnerSocketId: partnerId, 
            sessionId,
            intent 
          });

          // Update Partner
          storage.updateUserState(partnerId, 'MATCHED', { 
            partnerSocketId: socket.id, 
            sessionId,
            intent: partner.intent // Partner keeps their original intent
          });

          // Determine Partner's Role (inverse of mine, or peer)
          let partnerRole = 'peer';
          if (role === 'talker') partnerRole = 'listener';
          else if (role === 'listener') partnerRole = 'talker';

          // Notify Both
          io.to(socket.id).emit(SOCKET_EVENTS.MATCH_FOUND, { sessionId, role, partnerIntent: partner.intent });
          io.to(partnerId).emit(SOCKET_EVENTS.MATCH_FOUND, { sessionId, role: partnerRole, partnerIntent: intent });

          // Transition to ACTIVE automatically after short delay or client confirmation?
          // MENTI specs say "Redirected to /room/{sessionId}". 
          // Client will navigate, then socket stays connected.
          storage.updateUserState(socket.id, 'ACTIVE');
          storage.updateUserState(partnerId, 'ACTIVE');

          console.log(`Matched ${socket.id} and ${partnerId} in session ${sessionId}`);

        } else {
          // --- No Match, Queue ---
          storage.addToQueue(socket.id, intent);
          storage.updateUserState(socket.id, 'WAITING', { intent });
          // Inform client they are waiting
          // We can emit a specific event or just rely on them initiating the UI change
        }

      } catch (err) {
        console.error("Join Queue Error:", err);
        socket.emit(SOCKET_EVENTS.ERROR, { message: "Invalid request" });
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE, (payload) => {
      try {
        const { content } = messageSchema.parse(payload);
        const user = storage.getUser(socket.id);

        if (!user || user.state !== 'ACTIVE' || !user.partnerSocketId) {
          return; // Ignore if not chatting
        }

        const partnerId = user.partnerSocketId;
        
        // Relay message
        io.to(partnerId).emit(SOCKET_EVENTS.MESSAGE, {
          id: randomUUID(),
          content,
          senderId: socket.id,
          timestamp: Date.now()
        });

      } catch (err) {
        console.error("Message Error:", err);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_SESSION, () => {
      handleDisconnect(socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      handleDisconnect(socket.id);
    });
  });

  // Helper to handle disconnects (explicit or socket drop)
  function handleDisconnect(socketId: string) {
    const user = storage.getUser(socketId);
    if (!user) return;

    // Remove from queue if waiting
    storage.removeFromQueue(socketId);

    // If active/matched, notify partner
    if ((user.state === 'MATCHED' || user.state === 'ACTIVE') && user.partnerSocketId) {
      const partnerId = user.partnerSocketId;
      const partner = storage.getUser(partnerId);
      
      if (partner) {
        io.to(partnerId).emit(SOCKET_EVENTS.PARTNER_DISCONNECTED);
        // Reset partner state or end their session?
        // Spec: "Both users are removed... session destroyed"
        // So partner is essentially kicked to ENDED state.
        storage.updateUserState(partnerId, 'IDLE', { partnerSocketId: undefined, sessionId: undefined }); 
        // Or keep them in 'ENDED' state until they choose to leave?
        // Prompt says "Session is permanently destroyed".
      }
    }

    // Remove user
    storage.removeUser(socketId);
  }

  // --- HTTP Routes ---
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
