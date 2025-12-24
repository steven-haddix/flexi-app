import { neonAuth } from "@neondatabase/auth/next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gyms, workouts } from "@/db/schema";

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
    const { name, description, imageUrl, equipment } = json;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (equipment !== undefined) updateData.equipment = equipment;

    if (Object.keys(updateData).length === 0) {
      return new Response("No update data provided", { status: 400 });
    }

    await db
      .update(gyms)
      .set(updateData)
      .where(and(eq(gyms.id, id), eq(gyms.userId, user.id)));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update location:", error);
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
