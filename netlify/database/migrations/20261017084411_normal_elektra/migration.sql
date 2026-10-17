CREATE TABLE "btech_subjects" (
	"id" text PRIMARY KEY,
	"subject_name" text NOT NULL,
	"code" text NOT NULL,
	"credits" integer DEFAULT 3,
	"internal_marks" integer DEFAULT 0,
	"external_marks" integer DEFAULT 0,
	"grade" text DEFAULT 'A',
	"status" text DEFAULT 'ongoing' NOT NULL,
	"semester" integer DEFAULT 5
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY,
	"platform" text NOT NULL,
	"title" text NOT NULL,
	"module" text DEFAULT '',
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text DEFAULT '',
	"date" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coding_practice" (
	"id" text PRIMARY KEY,
	"platform" text NOT NULL,
	"problem_title" text NOT NULL,
	"difficulty" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'solved' NOT NULL,
	"date" text NOT NULL,
	"notes" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "daily_summaries" (
	"date" text PRIMARY KEY,
	"summary_text" text DEFAULT '',
	"mood" text DEFAULT 'productive',
	"blockers" text DEFAULT '',
	"goals_tomorrow" text DEFAULT '',
	"key_takeaways" text DEFAULT '',
	"energy_rating" integer DEFAULT 3,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" text PRIMARY KEY,
	"user_id" integer NOT NULL,
	"created_at" text NOT NULL,
	"expires_at" text NOT NULL,
	"last_activity_at" text NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_works" (
	"id" text PRIMARY KEY,
	"subject_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'Assignment' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"deadline" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"notes" text DEFAULT '',
	"category" text DEFAULT 'Engineering' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"planned_mins" integer DEFAULT 45 NOT NULL,
	"actual_mins" integer DEFAULT 0 NOT NULL,
	"date" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" text NOT NULL,
	"completed_at" text,
	"subject_id" text
);
--> statement-breakpoint
CREATE TABLE "time_logs" (
	"id" text PRIMARY KEY,
	"task_id" text,
	"duration_seconds" integer NOT NULL,
	"type" text DEFAULT 'focus' NOT NULL,
	"started_at" text NOT NULL,
	"ended_at" text NOT NULL,
	"notes" text DEFAULT '',
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"created_at" text NOT NULL,
	"last_login_at" text
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" text PRIMARY KEY,
	"exercise" text NOT NULL,
	"category" text DEFAULT 'Push' NOT NULL,
	"sets" integer DEFAULT 3,
	"reps" text DEFAULT '12',
	"weight" text DEFAULT 'Bodyweight',
	"status" text DEFAULT 'pending' NOT NULL,
	"date" text NOT NULL,
	"created_at" text NOT NULL
);
