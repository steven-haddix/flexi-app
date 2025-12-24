import { google } from "@ai-sdk/google";
import { neonAuth } from "@neondatabase/auth/next/server";
import { generateText, NoOutputGeneratedError, Output, stepCountIs } from "ai";
import { z } from "zod";

export const maxDuration = 60;

/**
 * Schema for the scan result
 * Example:
 * {
 *   name: "Home Gym",
 *
 *   description: "A small home gym with basic equipment",
 *   equipment: [
 *     { name: "Dumbbell", notes: "5kg" },
 *     { name: "Resistance Bands" },
 *   ],
 * }
 */
const scanResultSchema = z.object({
    name: z
        .string()
        .describe("A suitable name for this gym location based on the image"),
    description: z.string().describe("A brief description of the space"),
    equipment: z.array(
        z.object({
            name: z.string().describe("Name of the equipment"),
            notes: z
                .string()
                .optional()
                .describe("Details like weight range, brand, or type"),
        }),
    ),
});

export async function POST(req: Request) {
    const { user } = await neonAuth();

    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { image, description } = await req.json();

        if (!image && !description) {
            return new Response("No image or description provided", {
                status: 400,
            });
        }

        const prompt = [
            "Analyze this gym input to identify the gym type (Home, Commercial, etc.) and list all visible workout equipment.",
            "If a text description is provided, use it to infer equipment and craft a concise description.",
            "Be thorough and consistent with the input.",
            description ? `User description: ${description}` : null,
        ]
            .filter(Boolean)
            .join(" ");

        const result = await generateText({
            model: "google/gemini-3-flash",
            output: Output.object({
                schema: scanResultSchema,
            }),
            stopWhen: stepCountIs(30),
            messages: [
                {
                    role: "user",
                    content: image
                        ? [
                            {
                                type: "text",
                                text: prompt,
                            },
                            { type: "image", image },
                        ]
                        : [
                            {
                                type: "text",
                                text: prompt,
                            },
                        ],
                },
            ],
        });

        let output: z.infer<typeof scanResultSchema>;
        try {
            output = result.output;
        } catch (error) {
            if (NoOutputGeneratedError.isInstance(error) && result.text) {
                output = scanResultSchema.parse(JSON.parse(result.text));
            } else {
                throw error;
            }
        }

        return Response.json(output);
    } catch (error) {
        console.error("Scan error:", error);
        return new Response("Failed to scan image", { status: 500 });
    }
}
