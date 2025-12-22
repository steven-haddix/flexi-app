ALTER TABLE "workouts" ALTER COLUMN "gym_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "deleted_at" timestamp;