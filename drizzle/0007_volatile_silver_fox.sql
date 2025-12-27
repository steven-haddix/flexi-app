CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"selected_gym_id" uuid,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_selected_gym_id_gyms_id_fk" FOREIGN KEY ("selected_gym_id") REFERENCES "public"."gyms"("id") ON DELETE no action ON UPDATE no action;