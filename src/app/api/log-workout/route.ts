import { neonAuth } from "@neondatabase/auth/next/server";
import { generateText, NoOutputGeneratedError, Output } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { workouts } from "@/db/schema";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { prompt, clientDate, gymId } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const outputSchema = z.object({
      title: z.string(),
      content: z
        .string()
        .describe("Markdown formatted workout summary with exercises"),
      date: z.iso.datetime(),
    });

    const result = await generateText({
      model: "google/gemini-3-flash",
      output: Output.object({
        schema: outputSchema,
      }),

      system: `You are an intelligent fitness assistant. 
            Your goal is to parse natural language descriptions of workouts into structured data.
            
            Current Date (Client): ${clientDate || new Date().toISOString()}
            
            Instructions:
            1. Analyze the user's input to understand the exercises, sets, reps, and any other details.
            2. Determine the date of the workout. Context clues like "yesterday", "last monday", "aug 25" should be used relative to the "Current Date".
                - If no date is specified, assume today (Current Date).
            3. Create a Markdown formatted description of the workout. Use headers, bullets, and bold text for readability.
            4. Generate a concise title.
            `,
      prompt: prompt,
    });

    let output: z.infer<typeof outputSchema>;
    try {
      output = result.output;
    } catch (error) {
      if (NoOutputGeneratedError.isInstance(error) && result.text) {
        output = outputSchema.parse(JSON.parse(result.text));
      } else {
        throw error;
      }
    }

    const [newWorkout] = await db
      .insert(workouts)
      .values({
        userId: user.id,
        gymId,
        name: output.title,
        description: output.content.replace(/\\n/g, "\n"),
        date: new Date(output.date),
      })
      .returning();

    return Response.json(newWorkout);
  } catch (error) {
    console.error("Log workout error:", error);
    return new Response("Failed to log workout", { status: 500 });
  }
}
