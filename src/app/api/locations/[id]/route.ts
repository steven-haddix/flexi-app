import { neonAuth } from "@neondatabase/auth/next/server";
import { db } from "@/db";
import { gyms, workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { user } = await neonAuth();

    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        // Delete workouts associated with the gym first (manual cascade)
        await db.delete(workouts).where(eq(workouts.gymId, id));

        // Delete the gym
        await db
            .delete(gyms)
            .where(and(eq(gyms.id, id), eq(gyms.userId, user.id))); // Ensure ownership

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete location:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
