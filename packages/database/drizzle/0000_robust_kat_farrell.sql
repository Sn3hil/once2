CREATE TYPE "public"."codex_entry_type" AS ENUM('character', 'location', 'item', 'faction', 'event', 'lore');--> statement-breakpoint
CREATE TYPE "public"."echo_status" AS ENUM('pending', 'triggered', 'resolved', 'expired');--> statement-breakpoint
CREATE TYPE "public"."narrative_stance" AS ENUM('grimdark', 'heroic', 'grounded', 'mythic', 'noir');--> statement-breakpoint
CREATE TYPE "public"."story_mode" AS ENUM('protagonist', 'narrator');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."story_visibility" AS ENUM('private', 'public', 'unlisted');--> statement-breakpoint
CREATE TABLE "codex_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"entry_type" "codex_entry_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"related_entries" json DEFAULT '[]'::json,
	"first_mentioned_scene_id" integer,
	"last_updated_scene_id" integer,
	"user_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deferred_characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"vault_character_id" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"role" text,
	"trigger_condition" text NOT NULL,
	"introduced" boolean DEFAULT false NOT NULL,
	"introduced_at_scene_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "echoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"source_scene_id" integer NOT NULL,
	"description" text NOT NULL,
	"trigger_condition" text NOT NULL,
	"status" "echo_status" DEFAULT 'pending' NOT NULL,
	"resolved_at_scene_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "protagonists" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"health" integer DEFAULT 100 NOT NULL,
	"energy" integer DEFAULT 100 NOT NULL,
	"current_location" varchar(255) NOT NULL,
	"base_traits" json DEFAULT '[]'::json NOT NULL,
	"current_traits" json DEFAULT '[]'::json NOT NULL,
	"inventory" json DEFAULT '[]'::json NOT NULL,
	"scars" json DEFAULT '[]'::json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"turn_number" integer NOT NULL,
	"user_action" text NOT NULL,
	"narration" text NOT NULL,
	"protagonist_snapshot" json,
	"mood" varchar(50),
	"protagonist_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"genre" varchar(50) NOT NULL,
	"narrative_stance" "narrative_stance" DEFAULT 'heroic' NOT NULL,
	"story_mode" "story_mode" DEFAULT 'protagonist' NOT NULL,
	"status" "story_status" DEFAULT 'active' NOT NULL,
	"turn_count" integer DEFAULT 0 NOT NULL,
	"forked_from_story_id" integer,
	"forked_at_scene_id" integer,
	"visibility" "story_visibility" DEFAULT 'private' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "story_suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_upvotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "story_upvotes_story_id_user_id_unique" UNIQUE("story_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "vault_characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"traits" json DEFAULT '[]'::json NOT NULL,
	"voice" text,
	"backstory" text,
	"relationships" text,
	"unresolved_conflicts" text,
	"times_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
