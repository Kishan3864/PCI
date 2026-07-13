CREATE TYPE "public"."alert_channel" AS ENUM('email', 'slack');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('sent', 'failed', 'skipped_dedupe');--> statement-breakpoint
CREATE TYPE "public"."change_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."change_type" AS ENUM('new_script', 'script_modified', 'script_removed', 'header_changed', 'sri_removed');--> statement-breakpoint
CREATE TYPE "public"."free_scan_status" AS ENUM('queued', 'running', 'done', 'error');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('starter', 'pro', 'agency');--> statement-breakpoint
CREATE TYPE "public"."scan_frequency" AS ENUM('daily', '6h');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('queued', 'running', 'success', 'error');--> statement-breakpoint
CREATE TYPE "public"."script_status" AS ENUM('pending', 'authorized', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."verify_method" AS ENUM('dns', 'meta');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"change_id" text NOT NULL,
	"channel" "alert_channel" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "alert_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changes" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"script_id" text,
	"type" "change_type" NOT NULL,
	"severity" "change_severity" NOT NULL,
	"detail" jsonb NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" text
);
--> statement-breakpoint
CREATE TABLE "csp_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"blocked_uri" text NOT NULL,
	"violated_directive" text NOT NULL,
	"document_uri" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"site_id" text NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"pdf_path" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "free_scans" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"email" text,
	"status" "free_scan_status" DEFAULT 'queued' NOT NULL,
	"result_json" jsonb,
	"ip" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "header_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"headers_json" jsonb NOT NULL,
	"headers_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_members_org_user_uq" UNIQUE("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	"plan" "plan" DEFAULT 'starter' NOT NULL,
	"billing_customer_id" text,
	"trial_ends_at" timestamp with time zone DEFAULT now() + interval '14 days',
	"slack_webhook_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orgs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"url" text NOT NULL,
	"label" text DEFAULT 'Checkout' NOT NULL,
	"scan_frequency" "scan_frequency" DEFAULT 'daily' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_scan_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_site_url_uq" UNIQUE("site_id","url")
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" "scan_status" DEFAULT 'queued' NOT NULL,
	"http_status" integer,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "script_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"script_id" text NOT NULL,
	"sha256" text NOT NULL,
	"byte_size" integer,
	"sri_present" boolean DEFAULT false NOT NULL,
	"attrs" jsonb
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"url_key" text NOT NULL,
	"src_url" text,
	"is_inline" boolean DEFAULT false NOT NULL,
	"status" "script_status" DEFAULT 'pending' NOT NULL,
	"justification" text,
	"justified_by" text,
	"justified_at" timestamp with time zone,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_page_id" text,
	"missing_streak" integer DEFAULT 0 NOT NULL,
	"latest_sha256" text,
	"latest_byte_size" integer,
	"latest_sri_present" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_org_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"domain" text NOT NULL,
	"verify_token" text NOT NULL,
	"verified_at" timestamp with time zone,
	"verify_method" "verify_method",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sites_org_domain_uq" UNIQUE("org_id","domain")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"org_id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"provider_sub_id" text NOT NULL,
	"plan" "plan" NOT NULL,
	"status" text NOT NULL,
	"renews_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_change_id_changes_id_fk" FOREIGN KEY ("change_id") REFERENCES "public"."changes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_reports" ADD CONSTRAINT "csp_reports_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_reports" ADD CONSTRAINT "evidence_reports_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_reports" ADD CONSTRAINT "evidence_reports_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "header_snapshots" ADD CONSTRAINT "header_snapshots_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_observations" ADD CONSTRAINT "script_observations_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_observations" ADD CONSTRAINT "script_observations_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_justified_by_users_id_fk" FOREIGN KEY ("justified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_last_seen_page_id_pages_id_fk" FOREIGN KEY ("last_seen_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alerts_change_idx" ON "alerts" USING btree ("change_id");--> statement-breakpoint
CREATE INDEX "alerts_sent_idx" ON "alerts" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "changes_page_detected_idx" ON "changes" USING btree ("page_id","detected_at");--> statement-breakpoint
CREATE INDEX "changes_script_idx" ON "changes" USING btree ("script_id");--> statement-breakpoint
CREATE INDEX "csp_reports_site_idx" ON "csp_reports" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_reports_dedupe_uq" ON "csp_reports" USING btree ("site_id","blocked_uri","violated_directive","document_uri");--> statement-breakpoint
CREATE INDEX "evidence_reports_site_idx" ON "evidence_reports" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "free_scans_ip_created_idx" ON "free_scans" USING btree ("ip","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "header_snapshots_scan_uq" ON "header_snapshots" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "invitations_org_id_idx" ON "invitations" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_members_org_id_idx" ON "org_members" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_members_user_id_idx" ON "org_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pages_site_id_idx" ON "pages" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "scans_page_started_idx" ON "scans" USING btree ("page_id","started_at");--> statement-breakpoint
CREATE INDEX "script_observations_scan_idx" ON "script_observations" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "script_observations_script_idx" ON "script_observations" USING btree ("script_id");--> statement-breakpoint
CREATE INDEX "scripts_site_id_idx" ON "scripts" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scripts_site_url_key_uq" ON "scripts" USING btree ("site_id","url_key");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sites_org_id_idx" ON "sites" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_sub_uq" ON "subscriptions" USING btree ("provider","provider_sub_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");