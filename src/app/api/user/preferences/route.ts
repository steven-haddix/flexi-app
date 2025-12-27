import { neonAuth } from "@neondatabase/neon-js/auth/next";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updatePreferencesSchema = z.object({
    selectedGymId: z.string().uuid().nullable().optional(),
    preferences: z.record(z.string(), z.any()).optional(),
});

export async function GET() {
    const { user } = await neonAuth();

    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, user.id));

    return Response.json(prefs || {});
}

export async function PATCH(req: Request) {
    const { user } = await neonAuth();

    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { selectedGymId, preferences } = updatePreferencesSchema.parse(body);

        const [existing] = await db
            .select()
            .from(userPreferences)
            .where(eq(userPreferences.userId, user.id));

        if (existing) {
            const [updated] = await db
                .update(userPreferences)
                .set({
                    ...(selectedGymId !== undefined ? { selectedGymId } : {}),
                    ...(preferences !== undefined
                        ? {
                            preferences: { ...existing.preferences, ...preferences },
                        }
                        : {}),
                    updatedAt: new Date(),
                })
                .where(eq(userPreferences.userId, user.id))
                .returning();
            return Response.json(updated);
        }
        const [newItem] = await db
            .insert(userPreferences)
            .values({
                userId: user.id,
                selectedGymId: selectedGymId || null,
                preferences: preferences || {},
            })
            .returning();
        return Response.json(newItem);

    } catch (error) {
        console.error("Failed to update preferences:", error);
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data", { status: 400 });
        }
        return new Response("Internal Server Error", { status: 500 });
    }
}
