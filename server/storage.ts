import { type User, type InsertUser, type Intent } from "@shared/schema";
import { randomUUID } from "crypto";

// State Definitions
export type UserState = 'IDLE' | 'WAITING' | 'MATCHED' | 'ACTIVE';

export interface UserSession {
  socketId: string;
  intent: Intent;
  state: UserState;
  partnerSocketId?: string;
  sessionId?: string;
}

export interface IStorage {
  // User Management
  getUser(socketId: string): UserSession | undefined;
  createUser(socketId: string): UserSession;
  removeUser(socketId: string): void;
  updateUserState(socketId: string, state: UserState, updates?: Partial<UserSession>): void;
  
  // Queue Management
  addToQueue(socketId: string, intent: Intent): void;
  removeFromQueue(socketId: string): void;
  findMatch(socketId: string, intent: Intent): { partnerId: string; role: 'talker' | 'listener' | 'peer' } | undefined;
}

export class MemStorage implements IStorage {
  private users: Map<string, UserSession>;
  private queue: {
    talkers: Set<string>;
    listeners: Set<string>;
    both: Set<string>;
  };

  constructor() {
    this.users = new Map();
    this.queue = {
      talkers: new Set(),
      listeners: new Set(),
      both: new Set()
    };
  }

  // --- User Management ---

  getUser(socketId: string): UserSession | undefined {
    return this.users.get(socketId);
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

  // --- Queue Management ---

  addToQueue(socketId: string, intent: Intent): void {
    // Remove from other queues just in case
    this.removeFromQueue(socketId);

    if (intent === 'talk') this.queue.talkers.add(socketId);
    else if (intent === 'listen') this.queue.listeners.add(socketId);
    else if (intent === 'both') this.queue.both.add(socketId);
  }

  removeFromQueue(socketId: string): void {
    this.queue.talkers.delete(socketId);
    this.queue.listeners.delete(socketId);
    this.queue.both.delete(socketId);
  }

  findMatch(socketId: string, intent: Intent): { partnerId: string; role: 'talker' | 'listener' | 'peer' } | undefined {
    // Intent Rules:
    // Talk -> Listen, Both (as Listen)
    // Listen -> Talk, Both (as Talk)
    // Both -> Talk (as Listen), Listen (as Talk), Both (as Peer/Arbitrary)

    if (intent === 'talk') {
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
      // To avoid self-match (though set iteration shouldn't yield self if I'm not in it yet, but careful)
      for (const partnerId of this.queue.both) {
        if (partnerId !== socketId) {
           return { partnerId, role: 'peer' };
        }
      }
    }

    return undefined;
  }
}

export const storage = new MemStorage();
