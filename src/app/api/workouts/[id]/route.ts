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
    const { status } = body;

    await db
      .update(workouts)
      .set({
        status,
      })
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

