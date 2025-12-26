import { z } from "zod";

export const equipmentSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),
  name: z.string().min(1, "Name is required"),
  notes: z.string().optional(),
});

export const locationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().min(1, "Location name is required"),
  location: z.string().min(1, "Location address is required"), // Added to match DB
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  equipment: z.array(z.string()).default([]), // Changed to string array
  createdAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullish(),
});

export const workoutSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),
  name: z.string().min(1, "Name is required"), // Renamed from title
  description: z.string().optional(), // Renamed from content
  gymId: z.string().uuid().nullish(), // Renamed from locationId
  status: z.string().optional(),
  date: z.string().datetime(), // Changed to match DB requirement often used in API
  chatMessages: z.any().array().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const goalSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),
  name: z.string().min(1, "Goal name is required"),
  description: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullish(),
});

export type Location = z.infer<typeof locationSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type Goal = z.infer<typeof goalSchema>;
