import { neonAuth } from "@neondatabase/auth/next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { goals } from "@/db/schema";

const createGoalSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userGoals = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, user.id), isNull(goals.deletedAt)));

  return Response.json(userGoals);
}

export async function POST(req: Request) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description } = createGoalSchema.parse(body);

    const [newGoal] = await db
      .insert(goals)
      .values({
        userId: user.id,
        name,
        description,
      })
      .returning();

    return Response.json(newGoal);
  } catch (error) {
    console.error("Failed to create goal:", error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
