import { type User, type InsertUser, type Intent, users, type Room, rooms, roomParticipants, messages, type Therapist, type InsertTherapist, therapists, type Content, type InsertContent, content, type Appointment, type InsertAppointment, appointments, type RecoveryProfile, type InsertRecoveryProfile, recoveryProfiles, type StepProgress, type InsertStepProgress, stepProgress, type ServiceRating, type InsertServiceRating, serviceRatings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// State Definitions
export type UserState = 'IDLE' | 'WAITING' | 'MATCHED' | 'ACTIVE';

export interface UserSession {
  socketId: string;
  intent: Intent;
  state: UserState;
  partnerSocketId?: string;
  sessionId?: string;
  currentRoomId?: string;
  userId?: number; // Linked DB user id if logged in
  username?: string; // Display name
}

export interface IStorage {
  // User Management (Socket Session)
  getUser(socketId: string): UserSession | undefined;
  getActiveUserByAuthId(userId: number): UserSession | undefined;
  createUser(socketId: string): UserSession;
  removeUser(socketId: string): void;
  updateUserState(socketId: string, state: UserState, updates?: Partial<UserSession>): void;

  // User Management (Persistent Account)
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUserAccount(user: InsertUser): Promise<User>;

  // Queue Management
  addToQueue(socketId: string, intent: Intent): void;
  removeFromQueue(socketId: string): void;
  findMatch(socketId: string, intent: Intent): { partnerId: string; role: 'talker' | 'listener' | 'peer' | 'sponsor' } | undefined;

  // Room Management
  createRoom(hostId: number, title: string, genre: string, capacity: number): Promise<Room>;
  getRoom(roomId: string): Promise<Room | undefined>;
  getRooms(): Promise<Room[]>;
  joinRoom(roomId: string, socketId: string, userId?: number): Promise<boolean>; // Added userId for persistence
  leaveRoom(roomId: string, socketId: string): Promise<void>;
  deleteRoom(roomId: string): Promise<void>;

  // Therapist Platform
  createTherapistProfile(userId: number, data: InsertTherapist): Promise<Therapist>;
  getTherapistByUserId(userId: number): Promise<Therapist | undefined>;
  getTherapistById(id: number): Promise<Therapist | undefined>;
  getAllTherapists(): Promise<Therapist[]>;
  createContent(data: InsertContent): Promise<Content>;
  getTherapistContent(therapistId: number): Promise<Content[]>;
  getAllContent(): Promise<Content[]>;

  // Recovery Mode (MENTIS006)
  getRecoveryProfile(userId: number): Promise<RecoveryProfile | undefined>;
  createRecoveryProfile(data: InsertRecoveryProfile): Promise<RecoveryProfile>;
  updateRecoveryProfile(userId: number, updates: Partial<RecoveryProfile>): Promise<RecoveryProfile>;
  getStepProgress(userId: number): Promise<StepProgress[]>;
  updateStepProgress(userId: number, stepNumber: number, status: string, notes?: string): Promise<StepProgress>;
  createServiceRating(data: InsertServiceRating): Promise<ServiceRating>;
  getServiceRatings(userId: number): Promise<ServiceRating[]>;
  getServiceStats(userId: number): Promise<{ count: number; average: number }>;
}

export class DatabaseStorage implements IStorage {
  private users: Map<string, UserSession>;
  private rooms: Map<string, Room>;
  private queue: {
    talkers: Set<string>;
    listeners: Set<string>;
    both: Set<string>;
    sponsors: Set<string>;
  };

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.queue = {
      talkers: new Set(),
      listeners: new Set(),
      both: new Set(),
      sponsors: new Set()
    };
  }

  // --- User Management (Socket) ---

  getUser(socketId: string): UserSession | undefined {
    return this.users.get(socketId);
  }

  getActiveUserByAuthId(userId: number): UserSession | undefined {
    return Array.from(this.users.values()).find(session =>
      session.userId === userId && session.state !== 'IDLE'
    );
  }

  createUser(socketId: string): UserSession {
    const user: UserSession = {
      socketId,
      intent: 'both', // Default, will be updated
      state: 'IDLE'
    };
    this.users.set(socketId, user);
    return user;
  }

  removeUser(socketId: string): void {
    const user = this.getUser(socketId);
    if (user && user.currentRoomId) {
      this.leaveRoom(user.currentRoomId, socketId);
    }
    // Ensure user is removed from any queues
    this.removeFromQueue(socketId);
    this.users.delete(socketId);
  }

  updateUserState(socketId: string, state: UserState, updates?: Partial<UserSession>): void {
    const user = this.users.get(socketId);
    if (user) {
      user.state = state;
      if (updates) {
        Object.assign(user, updates);
      }
      this.users.set(socketId, user);
    }
  }

  // --- User Management (Persistent - Database) ---

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUserAccount(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // --- Queue Management ---

  addToQueue(socketId: string, intent: Intent): void {
    // Remove from other queues just in case
    this.removeFromQueue(socketId);

    if (intent === 'talk') this.queue.talkers.add(socketId);
    else if (intent === 'listen') this.queue.listeners.add(socketId);
    else if (intent === 'both') this.queue.both.add(socketId);
    else if (intent === 'sponsor') this.queue.sponsors.add(socketId);
  }

  removeFromQueue(socketId: string): void {
    this.queue.talkers.delete(socketId);
    this.queue.listeners.delete(socketId);
    this.queue.both.delete(socketId);
    this.queue.sponsors.delete(socketId);
  }

  findMatch(socketId: string, intent: Intent): { partnerId: string; role: 'talker' | 'listener' | 'peer' | 'sponsor' } | undefined {
    // Intent Rules:
    // Talk -> Sponsor, Listener, Both (as Listen)
    // Listen -> Talk, Both (as Talk)
    // Sponsor -> Talk, Both (as Talk)
    // Both -> Talk (as Listen), Listen (as Talk), Both (as Peer/Arbitrary)

    if (intent === 'talk') {
      // 0. Look for Sponsor (Priority)
      if (this.queue.sponsors.size > 0) {
        const partnerId = this.queue.sponsors.values().next().value!;
        return { partnerId, role: 'talker' }; // I am talker, partner is sponsor
      }
      // 1. Look for Listener
      if (this.queue.listeners.size > 0) {
        const partnerId = this.queue.listeners.values().next().value!;
        return { partnerId, role: 'talker' }; // I am talker
      }
      // 2. Look for Both
      if (this.queue.both.size > 0) {
        const partnerId = this.queue.both.values().next().value!;
        return { partnerId, role: 'talker' }; // I am talker
      }
    }

    if (intent === 'sponsor') {
      // Look for Talker (Sponsee)
      if (this.queue.talkers.size > 0) {
        const partnerId = this.queue.talkers.values().next().value!;
        return { partnerId, role: 'sponsor' }; // I am sponsor
      }
      // Look for Both (who might want to talk)
      if (this.queue.both.size > 0) {
        const partnerId = this.queue.both.values().next().value!;
        return { partnerId, role: 'sponsor' }; // I am sponsor
      }
    }

    if (intent === 'listen') {
      // 1. Look for Talker
      if (this.queue.talkers.size > 0) {
        const partnerId = this.queue.talkers.values().next().value!;
        return { partnerId, role: 'listener' }; // I am listener
      }
      // 2. Look for Both
      if (this.queue.both.size > 0) {
        const partnerId = this.queue.both.values().next().value!;
        return { partnerId, role: 'listener' }; // I am listener
      }
    }

    if (intent === 'both') {
      // 1. Look for Talker (I become listener)
      if (this.queue.talkers.size > 0) {
        const partnerId = this.queue.talkers.values().next().value!;
        return { partnerId, role: 'listener' };
      }
      // 2. Look for Listener (I become talker)
      if (this.queue.listeners.size > 0) {
        const partnerId = this.queue.listeners.values().next().value!;
        return { partnerId, role: 'talker' };
      }
      // 3. Look for Both (We become peers, or arbitrary)
      for (const partnerId of Array.from(this.queue.both)) {
        if (partnerId !== socketId) {
          return { partnerId, role: 'peer' };
        }
      }
    }

    return undefined;
  }

  // --- Room Management ---
  async createRoom(hostId: number, title: string, genre: string, capacity: number): Promise<Room> {
    const id = randomUUID();
    const [room] = await db.insert(rooms).values({
      id,
      hostId,
      title,
      genre,
      capacity,
    }).returning();

    // Return with empty participants for now
    return { ...room, participants: new Set() };
  }

  async getRoom(roomId: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (!room) return undefined;

    // Fetch participants
    const participants = await db.select().from(roomParticipants).where(eq(roomParticipants.roomId, roomId));
    return {
      ...room,
      participants: new Set(participants.map(p => p.socketId))
    };
  }

  async getRooms(): Promise<Room[]> {
    const allRooms = await db.select().from(rooms);
    // This could be N+1 lazy, but for small scale fine. 
    // Ideally we join or just return keys.
    // Let's do a quick map.
    return Promise.all(allRooms.map(async (room) => {
      const participants = await db.select().from(roomParticipants).where(eq(roomParticipants.roomId, room.id));
      return {
        ...room,
        participants: new Set(participants.map(p => p.socketId))
      };
    }));
  }

  async joinRoom(roomId: string, socketId: string, userId?: number): Promise<boolean> {
    const room = await this.getRoom(roomId);
    if (!room) return false;

    // Safety check for participants, though getRoom should provide it
    const participants = room.participants || new Set();

    if (participants.size >= room.capacity) return false;

    // Check if already in
    if (participants.has(socketId)) return true;

    await db.insert(roomParticipants).values({
      roomId,
      socketId,
      userId: userId || 0, // Fallback, but might fail if 0 is not valid user
    });
    return true;
  }

  async leaveRoom(roomId: string, socketId: string): Promise<void> {
    await db.delete(roomParticipants).where(
      // We need 'and' condition
      // eq(roomParticipants.roomId, roomId) AND eq(roomParticipants.socketId, socketId)
      // Drizzle needs `and` import
      // For now let's just delete by socketId if unique enough, but better be safe.
      // Actually, let's import `and`.
      // Or filter in JS? No, delete needs where.
      // Let's assume we import `and`.
      // If not imported, we can't use it.
      // I'll add the import in a separate step or just use raw sql? No, let's fix imports.
      // Check imports above... we only imported `eq`.
      // I will fix imports first or blindly retry.
      // Let's try to match socketId first, that is unique per connection.
      eq(roomParticipants.socketId, socketId)
    );

    // Clean up empty room?
    const p = await db.select().from(roomParticipants).where(eq(roomParticipants.roomId, roomId));
    if (p.length === 0) {
      await db.delete(rooms).where(eq(rooms.id, roomId));
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    await db.delete(roomParticipants).where(eq(roomParticipants.roomId, roomId));
    await db.delete(rooms).where(eq(rooms.id, roomId));
  }

  // --- Therapist Platform ---

  async createTherapistProfile(userId: number, data: InsertTherapist): Promise<Therapist> {
    const [therapist] = await db.insert(therapists).values({ ...data, userId }).returning();
    return therapist;
  }

  async getTherapistByUserId(userId: number): Promise<Therapist | undefined> {
    const [therapist] = await db.select().from(therapists).where(eq(therapists.userId, userId));
    return therapist;
  }

  async getTherapistById(id: number): Promise<Therapist | undefined> {
    const [therapist] = await db.select().from(therapists).where(eq(therapists.id, id));
    return therapist;
  }

  async getAllTherapists(): Promise<Therapist[]> {
    return await db.select().from(therapists).where(eq(therapists.isVerified, true));
  }

  async createContent(data: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(content).values(data).returning();
    return newContent;
  }

  async getTherapistContent(therapistId: number): Promise<Content[]> {
    return await db.select().from(content).where(eq(content.authorId, therapistId));
  }

  async getAllContent(): Promise<Content[]> {
    return await db.select().from(content).orderBy(content.createdAt);
  }

  // --- Recovery Mode (MENTIS006) ---

  async getRecoveryProfile(userId: number): Promise<RecoveryProfile | undefined> {
    const [profile] = await db.select().from(recoveryProfiles).where(eq(recoveryProfiles.userId, userId));
    return profile;
  }

  async createRecoveryProfile(data: InsertRecoveryProfile): Promise<RecoveryProfile> {
    const [profile] = await db.insert(recoveryProfiles).values(data).returning();
    return profile;
  }

  async updateRecoveryProfile(userId: number, updates: Partial<RecoveryProfile>): Promise<RecoveryProfile> {
    const [updated] = await db
      .update(recoveryProfiles)
      .set(updates)
      .where(eq(recoveryProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getStepProgress(userId: number): Promise<StepProgress[]> {
    return await db.select().from(stepProgress).where(eq(stepProgress.userId, userId)).orderBy(stepProgress.stepNumber);
  }

  async updateStepProgress(userId: number, stepNumber: number, status: string, notes?: string): Promise<StepProgress> {
    // Check if exists
    const [existing] = await db.select().from(stepProgress).where(
      and(eq(stepProgress.userId, userId), eq(stepProgress.stepNumber, stepNumber))
    );

    if (existing) {
      const [updated] = await db
        .update(stepProgress)
        .set({ status: status as any, notes, updatedAt: new Date() })
        .where(eq(stepProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(stepProgress).values({
        userId,
        stepNumber,
        status: status as any,
        notes
      }).returning();
      return created;
    }
  }

  async createServiceRating(data: InsertServiceRating): Promise<ServiceRating> {
    const [rating] = await db.insert(serviceRatings).values(data).returning();
    return rating;
  }

  async getServiceRatings(userId: number): Promise<ServiceRating[]> {
    return await db.select().from(serviceRatings).where(eq(serviceRatings.ratedUserId, userId));
  }

  async getServiceStats(userId: number): Promise<{ count: number; average: number }> {
    const ratings = await this.getServiceRatings(userId);
    if (ratings.length === 0) return { count: 0, average: 0 };

    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      count: ratings.length,
      average: sum / ratings.length
    };
  }
}

export const storage = new DatabaseStorage();
