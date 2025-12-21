import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { prompt, clientDate } = await req.json();

        if (!prompt) {
            return new Response("Prompt is required", { status: 400 });
        }

        const { output } = await generateText({
            model: "google/gemini-3-flash",
            output: Output.object({
                schema: z.object({
                    title: z
                        .string()
                        .describe(
                            'A short, descriptive title for the workout (e.g., "Full Body - Aug 25")',
                        ),
                    content: z
                        .string()
                        .describe(
                            "The full workout details formatted in Markdown. Include exercises, sets, reps, user notes, etc.",
                        ),
                    date: z
                        .string()
                        .describe(
                            "The date of the workout in ISO 8601 format (YYYY-MM-DD). Calculate this based on the user prompt relative to the current date provided.",
                        ),
                }),
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

        return Response.json(output);
    } catch (error) {
        console.error("Log workout error:", error);
        return new Response("Failed to log workout", { status: 500 });
    }
}
