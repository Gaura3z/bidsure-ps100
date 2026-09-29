CREATE TABLE IF NOT EXISTS "source_adapter_modes" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id"),
  "adapter_name" text NOT NULL,
  "mode" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "source_adapter_modes_org_adapter_unique" ON "source_adapter_modes" ("organization_id", "adapter_name");
CREATE INDEX IF NOT EXISTS "source_adapter_modes_organization_idx" ON "source_adapter_modes" ("organization_id");
