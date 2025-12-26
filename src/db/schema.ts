import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { type UIMessage } from "ai";

export const gyms = pgTable("gyms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  equipment: jsonb("equipment").$type<string[]>(), // Store array of strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  gymId: uuid("gym_id").references(() => gyms.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status"),
  date: timestamp("date").notNull(),
  chatMessages: jsonb("chat_messages").$type<UIMessage[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
