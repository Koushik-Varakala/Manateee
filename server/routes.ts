import type { Express } from "express";
import type { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { joinQueueSchema, messageSchema, SOCKET_EVENTS, type Intent } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
  sessionMiddleware: any
): Promise<Server> {
  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*", // Adjust for production if needed
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Share session with socket.io
  io.engine.use(sessionMiddleware);

  io.on("connection", async (socket) => {
    const userSession = storage.createUser(socket.id);

    // access session
    const req = socket.request as any;
    if (req.session && req.session.passport && req.session.passport.user) {
      userSession.userId = req.session.passport.user;
    }

    console.log(`Socket connected: ${socket.id} (User: ${userSession.userId || 'Guest'})`);

    const authUserId = req.session?.passport?.user;

    if (authUserId) {
      const existingSession = storage.getActiveUserByAuthId(authUserId);
      if (existingSession && existingSession.currentRoomId) {
        const room = await storage.getRoom(existingSession.currentRoomId);
        if (room) {
          console.log(`Restoring session for user ${authUserId} to room ${room.title}`);

          // Update new socket
          await storage.joinRoom(room.id, socket.id, authUserId);
          storage.updateUserState(socket.id, 'ACTIVE', {
            currentRoomId: room.id,
            userId: authUserId,
            username: existingSession.username
          });

          socket.join(room.id);
          const serializedRoom = { ...room, participants: Array.from(room.participants || []) };

          // Emit join event immediately so UI updates
          socket.emit("room_joined", { roomId: room.id, room: serializedRoom });
        }
      }
    }

    // --- Event Handlers ---

    const handleMatch = (socketId: string, intent: Intent) => {
      const user = storage.getUser(socketId);
      if (!user) return; // Should exist

      console.log(`User ${socketId} seeking match with intent: ${intent}`);

      const match = storage.findMatch(socketId, intent);

      if (match) {
        // --- Match Found! ---
        const { partnerId, role } = match;
        const partner = storage.getUser(partnerId);

        if (!partner) {
          // Retry?
          storage.addToQueue(socketId, intent);
          storage.updateUserState(socketId, 'WAITING', { intent });
          io.to(socketId).emit('state_update', { state: 'WAITING' });
          return;
        }

        storage.removeFromQueue(partnerId);
        const sessionId = randomUUID();

        // Update Self
        storage.updateUserState(socketId, 'MATCHED', {
          partnerSocketId: partnerId,
          sessionId,
          intent
        });

        // Update Partner
        storage.updateUserState(partnerId, 'MATCHED', {
          partnerSocketId: socketId,
          sessionId,
          intent: partner.intent
        });

        // Determine Partner's Role
        let partnerRole = 'peer';
        if (role === 'talker') partnerRole = 'listener';
        else if (role === 'listener') partnerRole = 'talker';
        else if (role === 'sponsor') partnerRole = 'talker';

        // Refinement based on actual intents
        if (partner.intent === 'sponsor') partnerRole = 'sponsor';
        if (partner.intent === 'talk') {
          if (role === 'sponsor') partnerRole = 'talker';
        }

        // Notify Both (send partnerSocketId so client can rate/identify)
        io.to(socketId).emit(SOCKET_EVENTS.MATCH_FOUND, { sessionId, role, partnerIntent: partner.intent, partnerSocketId: partnerId });
        io.to(partnerId).emit(SOCKET_EVENTS.MATCH_FOUND, { sessionId, role: partnerRole, partnerIntent: intent, partnerSocketId: socketId });

        storage.updateUserState(socketId, 'ACTIVE');
        storage.updateUserState(partnerId, 'ACTIVE');

        console.log(`Matched ${socketId} (${role}) and ${partnerId} (${partnerRole}) in session ${sessionId}`);

      } else {
        // --- Queue ---
        storage.addToQueue(socketId, intent);
        storage.updateUserState(socketId, 'WAITING', { intent });
        io.to(socketId).emit('state_update', { state: 'WAITING' });
      }
    };

    socket.on(SOCKET_EVENTS.JOIN_QUEUE, (payload) => {
      try {
        const { intent } = joinQueueSchema.parse(payload);
        const user = storage.getUser(socket.id);
        if (!user || user.state !== 'IDLE') return;
        handleMatch(socket.id, intent);
      } catch (err) {
        console.error("Join Queue Error:", err);
      }
    });

    socket.on("emergency_support", () => {
      const user = storage.getUser(socket.id);
      if (!user) return;
      // Priority match logic is handled by findMatch preferring sponsors for 'talk' intent
      // We force 'talk' intent here
      handleMatch(socket.id, 'talk');
    });

    socket.on(SOCKET_EVENTS.MESSAGE, (payload) => {
      try {
        const { content } = messageSchema.parse(payload);
        const user = storage.getUser(socket.id);

        if (!user) return;

        if (user.currentRoomId) {
          // Group Chat Message
          io.to(user.currentRoomId).emit(SOCKET_EVENTS.MESSAGE, {
            id: randomUUID(),
            content,
            senderId: socket.id,
            timestamp: Date.now(),
            senderName: user.username || 'Anonymous'
          });
          return;
        }

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

    socket.on(SOCKET_EVENTS.LEAVE_SESSION, async () => {
      await endSession(socket.id);
      // Also confirm to client they are reset?
      // Client calls resetsession() locally, so state 'IDLE' is assumed.
    });

    // --- Group Chat Events ---

    socket.on(SOCKET_EVENTS.CREATE_ROOM, async (payload) => {
      const user = storage.getUser(socket.id);
      const req = socket.request as any;
      // Determine if allowed to host? (Check if logged in)
      if (!req.session?.passport?.user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: "Must be logged in to host" });
      }

      const { title, genre, capacity } = payload; // Validate strict schema later
      const userRecord = await storage.getUserById(req.session.passport.user);
      const room = await storage.createRoom(req.session.passport.user, title, genre, capacity || 5);

      await storage.joinRoom(room.id, socket.id, req.session.passport.user);
      storage.updateUserState(socket.id, 'ACTIVE', { currentRoomId: room.id, userId: req.session.passport.user, username: userRecord?.username });

      socket.join(room.id);
      socket.emit("room_joined", { roomId: room.id, room });
      // Broadcast room list update to everyone
      const rooms = await storage.getRooms();
      const serializedRooms = rooms.map(r => ({ ...r, participants: Array.from(r.participants || []) }));
      io.emit(SOCKET_EVENTS.ROOM_LIST, serializedRooms);
    });

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload) => {
      const { roomId } = payload;
      const room = await storage.getRoom(roomId);
      if (!room) return socket.emit(SOCKET_EVENTS.ERROR, { message: "Room not found" });

      const req = socket.request as any;
      const userId = req.session?.passport?.user;

      const success = await storage.joinRoom(roomId, socket.id, userId);
      if (!success) return socket.emit(SOCKET_EVENTS.ERROR, { message: "Room full or error" });

      let username = `Guest-${socket.id.substring(0, 4)}`;
      if (userId) {
        const userRecord = await storage.getUserById(userId);
        if (userRecord) username = userRecord.username;
      }

      storage.updateUserState(socket.id, 'ACTIVE', { currentRoomId: roomId, username });
      socket.join(roomId);

      const serializedRoom = { ...room, participants: Array.from(room.participants || []) };
      socket.emit("room_joined", { roomId, room: serializedRoom });
      io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, serializedRoom); // Notify flow
    });

    socket.on("get_rooms", async () => {
      const rooms = await storage.getRooms();
      const serializedRooms = rooms.map(r => ({ ...r, participants: Array.from(r.participants || []) }));
      socket.emit(SOCKET_EVENTS.ROOM_LIST, serializedRooms);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      handleDisconnect(socket.id);
    });
  });

  // Helper to cleanly end a session (1-1 or Room) without disconnecting the socket
  async function endSession(socketId: string) {
    const user = storage.getUser(socketId);
    if (!user) return;

    // Remove from queue if waiting
    storage.removeFromQueue(socketId);

    // If in Group Room
    if (user.currentRoomId) {
      await storage.leaveRoom(user.currentRoomId, socketId);
      const room = await storage.getRoom(user.currentRoomId);
      if (room) {
        io.to(user.currentRoomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room);
      } else {
        // Room destroyed? Broadcast list update
        const rooms = await storage.getRooms();
        const serializedRooms = rooms.map(r => ({ ...r, participants: Array.from(r.participants || []) }));
        io.emit(SOCKET_EVENTS.ROOM_LIST, serializedRooms);
      }
      // Reset user state
      storage.updateUserState(socketId, 'IDLE', { currentRoomId: undefined });
    }

    // If active/matched (1-1)
    if ((user.state === 'MATCHED' || user.state === 'ACTIVE') && user.partnerSocketId) {
      const partnerId = user.partnerSocketId;
      const partner = storage.getUser(partnerId);

      // Notify partner
      if (partner) {
        io.to(partnerId).emit(SOCKET_EVENTS.PARTNER_DISCONNECTED);
        // Partner goes to ENDED state (client-side), server side we reset them to IDLE?
        // If we reset them to IDLE immediately, they might get matched again while seeing "Chat Ended" screen.
        // Better to set them to 'IDLE' state in storage so they CAN join queue, but client UI handles the 'Ended' screen.
        storage.updateUserState(partnerId, 'IDLE', { partnerSocketId: undefined, sessionId: undefined, intent: undefined });
      }

      // Reset self
      storage.updateUserState(socketId, 'IDLE', { partnerSocketId: undefined, sessionId: undefined, intent: undefined });
    }
  }

  // Handle socket disconnect
  async function handleDisconnect(socketId: string) {
    await endSession(socketId);
    storage.removeUser(socketId);
  }

  // --- HTTP Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Therapist Platform Routes ---

  app.get("/api/therapists", async (req, res) => {
    const therapists = await storage.getAllTherapists();
    res.json(therapists);
  });

  app.get("/api/therapists/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const therapist = await storage.getTherapistById(id);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    // Fetch their content too
    const content = await storage.getTherapistContent(id);
    res.json({ ...therapist, content });
  });

  // Create/Update Profile
  app.post("/api/therapists/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // TODO: Validate input schema
    const data = req.body;
    const existing = await storage.getTherapistByUserId(req.user!.id);

    if (existing) {
      // Update logic (Not implemented in storage yet, but effectively similar to create if using upsert or just separate update method)
      // For MVP let's just return existing
      return res.json(existing);
    }

    const therapist = await storage.createTherapistProfile(req.user!.id, data);
    res.status(201).json(therapist);
  });

  app.get("/api/content", async (req, res) => {
    const content = await storage.getAllContent();
    res.json(content);
  });

  app.post("/api/content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Check if user is therapist
    const therapist = await storage.getTherapistByUserId(req.user!.id);
    if (!therapist) return res.status(403).json({ message: "Only therapists can post content" });

    const { title, body, type } = req.body;
    const content = await storage.createContent({
      title,
      body,
      type,
      authorId: therapist.id
    });
    res.status(201).json(content);
  });

  // --- Recovery Mode Routes (MENTIS006) ---

  app.get("/api/recovery/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stats = await storage.getServiceStats(req.user!.id);
    const profile = await storage.getRecoveryProfile(req.user!.id);
    let badge = "None";
    if (stats.count >= 50 && stats.average >= 4.5) badge = "Recovery Anchor";
    else if (stats.count >= 10) badge = "Consistent Companion";
    else if (stats.count >= 1) badge = "Willing Heart";

    if (!profile) {
      // Create default if not exists
      const newProfile = await storage.createRecoveryProfile({
        userId: req.user!.id,
        pseudonym: `Member-${randomUUID().substring(0, 8)}`, // Default, user can change later
        soberSince: new Date()
      });
      return res.json({ ...newProfile, badge, stats });
    }
    res.json({ ...profile, badge, stats });
  });

  app.post("/api/recovery/reset", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Reset clock
    const updated = await storage.updateRecoveryProfile(req.user!.id, {
      soberSince: new Date()
    });
    res.json(updated);
  });

  app.get("/api/recovery/steps", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const steps = await storage.getStepProgress(req.user!.id);
    res.json(steps);
  });

  app.post("/api/recovery/steps/:step", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stepNumber = parseInt(req.params.step);
    const { status, notes } = req.body;
    const progress = await storage.updateStepProgress(req.user!.id, stepNumber, status, notes);
    res.json(progress);
  });

  app.post("/api/ratings", async (req, res) => {
    // Guests can rate too
    const { rating, sessionId, partnerSocketId } = req.body;
    const raterId = req.user?.id || null;

    const partner = storage.getUser(partnerSocketId);

    if (!partner) {
      console.warn(`Could not find partner ${partnerSocketId} for rating`);
      return res.sendStatus(200);
    }

    if (!partner.userId) {
      return res.sendStatus(200);
    }

    await storage.createServiceRating({
      raterId,
      ratedUserId: partner.userId,
      rating,
      sessionId
    });

    res.sendStatus(201);
  });

  return httpServer;
}

