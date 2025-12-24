import { neonAuth } from "@neondatabase/auth/next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { goals } from "@/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const json = await req.json();
    const { name, description } = json;

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return new Response("No update data provided", { status: 400 });
    }

    await db
      .update(goals)
      .set(updateData)
      .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update goal:", error);
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

  const { id } = await params;

  try {
    await db
      .update(goals)
      .set({ deletedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, user.id)));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
