import { neonAuth } from "@neondatabase/auth/next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Only allow updating specific fields
    const { status, date } = body;

    const updateData: { status?: string; date?: Date } = {};
    if (status) updateData.status = status;
    if (date) updateData.date = new Date(date);

    if (Object.keys(updateData).length === 0) {
      throw new Error("No values to set");
    }

    await db
      .update(workouts)
      .set(updateData)
      .where(and(eq(workouts.id, id), eq(workouts.userId, user.id)));

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Failed to update workout:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;

    await db
      .delete(workouts)
      .where(and(eq(workouts.id, id), eq(workouts.userId, user.id)));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete workout:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
