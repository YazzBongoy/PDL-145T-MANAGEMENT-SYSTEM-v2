-- Raw SQL migration to convert Location column to PostGIS geometry type
-- This migration must be run after the Prisma migration to properly handle PostGIS types

-- Ensure PostGIS extension is enabled (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Convert Location column from TEXT to geometry(Point,4326)
ALTER TABLE "Site"
  ALTER COLUMN "Location" TYPE geometry(Point,4326) USING "Location"::geometry;

-- Create spatial index on Location column using GIST
CREATE INDEX site_location_gix ON "Site" USING GIST ("Location");
