import { neonAuth } from "@neondatabase/neon-js/auth/next";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createWorkoutSchema = z.object({
  gymId: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime(),
});

export async function GET() {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, user.id));

  return Response.json(userWorkouts);
}

export async function POST(req: Request) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { gymId, name, description, date } = createWorkoutSchema.parse(body);

    const [newWorkout] = await db
      .insert(workouts)
      .values({
        userId: user.id,
        gymId,
        name,
        description,
        date: new Date(date),
      })
      .returning();

    return Response.json(newWorkout);
  } catch (error) {
    console.error("Failed to create workout:", error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
