import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We keep these minimal as the core logic is in-memory/ephemeral as per requirements.
// But we define shapes here for shared type safety.

export const intentSchema = z.enum(["talk", "listen", "both"]);
export type Intent = z.infer<typeof intentSchema>;

// Socket.IO Events & Payloads
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_QUEUE: 'join_queue',
  MATCH_FOUND: 'match_found',
  MESSAGE: 'message',
  PARTNER_DISCONNECTED: 'partner_disconnected',
  LEAVE_SESSION: 'leave_session',
  SESSION_ENDED: 'session_ended',
  ERROR: 'error'
} as const;

export const joinQueueSchema = z.object({
  intent: intentSchema
});

export const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const matchPayloadSchema = z.object({
  sessionId: z.string(),
  partnerIntent: intentSchema,
  role: z.enum(["listener", "talker", "peer"]), // peer is for both/both
});

export type JoinQueuePayload = z.infer<typeof joinQueueSchema>;
export type MessagePayload = z.infer<typeof messageSchema>;
export type MatchPayload = z.infer<typeof matchPayloadSchema>;

// Although we don't persist messages, we define the table structure 
// that *would* exist if we did, to satisfy project patterns.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
