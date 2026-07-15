ALTER TABLE "script_observations" ALTER COLUMN "scan_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "runtime_seen" boolean DEFAULT false NOT NULL;