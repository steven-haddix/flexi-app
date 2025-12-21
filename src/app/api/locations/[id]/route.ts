import { neonAuth } from "@neondatabase/auth/next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gyms, workouts } from "@/db/schema";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    // Soft delete the gym
    await db
      .update(gyms)
      .set({ deletedAt: new Date() })
      .where(and(eq(gyms.id, id), eq(gyms.userId, user.id))); // Ensure ownership

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete location:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
