import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We keep these minimal as the core logic is in-memory/ephemeral as per requirements.
// But we define shapes here for shared type safety.

export const intentSchema = z.enum(["talk", "listen", "both", "sponsor"]);
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
  ERROR: 'error',
  // Group Chat
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_LIST: 'room_list',
  ROOM_UPDATE: 'room_update'
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
  partnerSocketId: z.string().optional(),
  role: z.enum(["listener", "talker", "peer", "sponsor"]), // peer is for both/both
});

export type JoinQueuePayload = z.infer<typeof joinQueueSchema>;
export type MessagePayload = z.infer<typeof messageSchema>;
export type MatchPayload = z.infer<typeof matchPayloadSchema>;

// Although we don't persist messages, we define the table structure 
// that *would* exist if we did, to satisfy project patterns.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  isGuest: boolean("is_guest").default(false).notNull(),
  role: text("role", { enum: ["user", "therapist", "admin"] }).default("user").notNull(),
});

export const roomParticipants = pgTable("room_participants", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull(), //.references(() => rooms.id), // Circular dependency risk if not careful, but fine here
  userId: serial("user_id").references(() => users.id).notNull(),
  socketId: text("socket_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertRoomParticipantSchema = createInsertSchema(roomParticipants);
export type RoomParticipant = typeof roomParticipants.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(), // Using text because we use UUIDs
  hostId: serial("host_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  capacity: serial("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  roomId: text("room_id").references(() => rooms.id),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms);
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect & {
  participants?: Set<string>; // Ephemeral
};

export const insertMessageSchema = createInsertSchema(messages);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// --- Therapist Platform ---

export const therapists = pgTable("therapists", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio").notNull(),
  specialties: text("specialties").array(), // Use text array for specialties
  isVerified: boolean("is_verified").default(false).notNull(),
});

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  authorId: serial("author_id").references(() => therapists.id).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type", { enum: ["post", "video"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  therapistId: serial("therapist_id").references(() => therapists.id).notNull(),
  userId: serial("user_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
});

export const insertTherapistSchema = createInsertSchema(therapists);
export type InsertTherapist = z.infer<typeof insertTherapistSchema>;
export type Therapist = typeof therapists.$inferSelect;

export const insertContentSchema = createInsertSchema(content);
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

export const insertAppointmentSchema = createInsertSchema(appointments);
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
// --- Recovery Mode (MENTIS006) ---

export const recoveryProfiles = pgTable("recovery_profiles", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
  soberSince: timestamp("sober_since").defaultNow().notNull(),
  pseudonym: text("pseudonym").notNull(),
  milestones: text("milestones").array(), // JSON array or text array for simplicity
  lastCheckIn: timestamp("last_check_in").defaultNow(),
});

export const stepProgress = pgTable("step_progress", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
  stepNumber: serial("step_number").notNull(), // 1 through 12
  status: text("status", { enum: ["not_started", "in_progress", "completed"] }).default("not_started").notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceRatings = pgTable("service_ratings", {
  id: serial("id").primaryKey(),
  raterId: integer("rater_id").references(() => users.id), // Nullable for guest ratings
  ratedUserId: serial("rated_user_id").references(() => users.id).notNull(),
  rating: serial("rating").notNull(), // 1-5
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecoveryProfileSchema = createInsertSchema(recoveryProfiles);
export type InsertRecoveryProfile = z.infer<typeof insertRecoveryProfileSchema>;
export type RecoveryProfile = typeof recoveryProfiles.$inferSelect;

export const insertStepProgressSchema = createInsertSchema(stepProgress);
export type InsertStepProgress = z.infer<typeof insertStepProgressSchema>;
export type StepProgress = typeof stepProgress.$inferSelect;

export const insertServiceRatingSchema = createInsertSchema(serviceRatings).pick({
  rating: true,
  sessionId: true,
  raterId: true,
  ratedUserId: true
});
export type InsertServiceRating = z.infer<typeof insertServiceRatingSchema>;
export type ServiceRating = typeof serviceRatings.$inferSelect;
