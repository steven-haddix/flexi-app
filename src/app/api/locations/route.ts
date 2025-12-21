import { neonAuth } from "@neondatabase/auth/next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { gyms } from "@/db/schema";

const createLocationSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  equipment: z.array(z.string()).optional(),
});

export async function GET() {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const locations = await db
    .select()
    .from(gyms)
    .where(and(eq(gyms.userId, user.id), isNull(gyms.deletedAt)));

  return Response.json(locations);
}

export async function POST(req: Request) {
  const { user } = await neonAuth();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, location, equipment } = createLocationSchema.parse(body);

    const [newLocation] = await db
      .insert(gyms)
      .values({
        userId: user.id,
        name,
        location,
        equipment,
      })
      .returning();

    return Response.json(newLocation);
  } catch (error) {
    console.error("Failed to create location:", error);
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
