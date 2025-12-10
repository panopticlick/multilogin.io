-- Migration: Time Machine Deepening
-- Adds additional metadata fields to profile_versions for catalog sync

ALTER TABLE profile_versions ADD COLUMN r2_key TEXT;
ALTER TABLE profile_versions ADD COLUMN domains TEXT DEFAULT '[]';
ALTER TABLE profile_versions ADD COLUMN local_storage_count INTEGER DEFAULT 0;
ALTER TABLE profile_versions ADD COLUMN session_storage_count INTEGER DEFAULT 0;
