import { neonAuth } from "@neondatabase/auth/next/server";
import { generateText } from "ai";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const {
      equipment,
      prompt: goals,
      experienceLevel,
      gymId,
    } = await req.json();

    const equipmentList =
      equipment && Array.isArray(equipment)
        ? typeof equipment[0] === "string"
          ? equipment
          : equipment.map((e: any) => e.name)
        : [];

    // Fetch the last 3 workouts to provide context
    // Fetch the last 3 workouts to provide context
    const previousWorkouts = await db
      .select({
        name: workouts.name,
        date: workouts.date,
        description: workouts.description,
      })
      .from(workouts)
      .where(eq(workouts.userId, user.id))
      .orderBy(desc(workouts.date))
      .limit(3);

    const workoutHistoryContext = previousWorkouts.length > 0
      ? previousWorkouts
        .map((w) => `### ${w.name} (${new Date(w.date).toLocaleDateString()})\n${w.description || "No details available."}`)
        .join("\n\n")
      : "No previous workouts found.";

    const { text } = await generateText({
      model: "google/gemini-3-flash",
      system:
        "You are an expert fitness coach. Create workouts based strictly on available equipment and previous workout history to ensure progression and variety. Return ONLY the workout plan in Markdown format. Start with a clear title.",
      prompt: `
        Create a complete workout session.
        
        **Context:**
        - Available Equipment: ${equipmentList.join(", ") || "Bodyweight only"}
        - User Goals: ${goals || "General fitness"}
        - Experience Level: ${experienceLevel || "Intermediate"}
        
        **Last 3 Workouts:**
        ${workoutHistoryContext}

        **Instructions:**
        1. Start with a warm-up.
        2. List exercises with sets and reps.
        3. Explain *why* this workout fits the equipment and follows the previous sessions.
        4. Keep it concise but motivating.
        5. Format using Markdown.
      `,
      experimental_telemetry: { isEnabled: true },
    });

    // Extract title from the first line of markdown if possible, else use default
    const titleMatch = text.match(/^#\s+(.+)$/m) || text.match(/^#+\s+(.+)$/m);
    const name = titleMatch ? titleMatch[1] : "Generated Workout";

    const [newWorkout] = await db
      .insert(workouts)
      .values({
        userId: user.id,
        gymId,
        name,
        description: text,
        status: "draft",
        date: new Date(),
      })
      .returning();

    return Response.json(newWorkout);
  } catch (error) {
    console.error("Workout generation error:", error);
    return new Response("Failed to generate workout", { status: 500 });
  }
}
