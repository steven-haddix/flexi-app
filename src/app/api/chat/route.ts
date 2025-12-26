import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { neonAuth } from "@neondatabase/auth/next/server";
import {
    createAgentUIStreamResponse,
    createIdGenerator,
    ToolLoopAgent,
    tool,
} from "ai";
import { eq } from "drizzle-orm";
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
        const body = await req.json();
        const { id, currentWorkout } = body ?? {};
        const workoutId = id; // useChat id is our workoutId
        const messages = Array.isArray(body?.messages) ? body.messages : undefined;

        if (!workoutId || !currentWorkout) {
            return new Response("Missing workout context", { status: 400 });
        }

        if (!messages) {
            return new Response("Missing chat messages", { status: 400 });
        }

        const systemPrompt = `
You are an expert fitness coach and personal trainer. You are chatting with a user about their specific workout session.

**Current Workout Context:**
Title: ${currentWorkout.name}
Date: ${new Date(currentWorkout.date).toLocaleDateString()}
Description/Plan:
${currentWorkout.description || "No description provided."}

**Your Goal:**
Help the user with this specific workout. You can:
1. Explain exercises or techniques.
2. Suggest modifications (easier/harder versions).
3. Offer motivation.
4. Update the workout plan if they ask for changes (e.g., "Change bench press to pushups").

**Tone:**
Encouraging, knowledgeable, clear, and concise.
`;

        const agent = new ToolLoopAgent({
            model: "google/gemini-3-flash",
            instructions: systemPrompt,
            providerOptions: {
                google: {
                    thinkingConfig: {
                        thinkingLevel: "medium",
                        includeThoughts: true,
                    },
                } satisfies GoogleGenerativeAIProviderOptions,
            },
            tools: {
                updateWorkoutDescription: tool({
                    description:
                        "Update the workout description/plan based on user request. Use this when the user asks to modify the exercises or structure.",
                    inputSchema: z.object({
                        newTitle: z
                            .string()
                            .optional()
                            .describe("The new title of the workout."),
                        newDescription: z
                            .string()
                            .describe(
                                "The new, complete markdown description of the workout.",
                            ),
                    }),
                    execute: async ({
                        newTitle,
                        newDescription,
                    }: {
                        newTitle?: string;
                        newDescription: string;
                    }) => {
                        await db
                            .update(workouts)
                            .set({ name: newTitle, description: newDescription })
                            .where(eq(workouts.id, workoutId));
                        return {
                            output: "Workout updated successfully.",
                        };
                    },
                }),
            },
        });

        return createAgentUIStreamResponse({
            agent,
            uiMessages: messages,
            generateMessageId: createIdGenerator({
                prefix: "msg",
                size: 16,
            }),
            onFinish: async ({ messages: responseMessages }) => {
                try {
                    // Prepend the incoming history (which includes the new user message)
                    // to the new response messages from the agent.
                    const fullHistory = [...messages, ...responseMessages];

                    await db
                        .update(workouts)
                        .set({ chatMessages: fullHistory })
                        .where(eq(workouts.id, workoutId));
                } catch (error) {
                    console.error("Failed to save chat messages:", error);
                }
            },
        });
    } catch (error) {
        console.error("Coach chat error:", error);
        return new Response("Failed to process chat", { status: 500 });
    }
}
