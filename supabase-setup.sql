-- ============================================================================
-- CUSEC Photobooth - Supabase Database Setup
-- ============================================================================
-- This script creates the database table and policies for storing photobooth
-- session data and image URLs.
--
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste and Run
-- ============================================================================

-- 1. Create the photo_sessions table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photo_sessions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session metadata
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  orientation TEXT NOT NULL CHECK (orientation IN ('portrait', 'landscape')),

  -- Storage URLs (public URLs from Supabase Storage)
  photo_1_url TEXT NOT NULL,
  photo_2_url TEXT NOT NULL,
  photo_3_url TEXT NOT NULL,
  photostrip_url TEXT NOT NULL,

  -- User contact (optional - filled when user emails themselves)
  email TEXT,

  -- Upload tracking
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  upload_status TEXT NOT NULL DEFAULT 'completed'
    CHECK (upload_status IN ('pending', 'completed', 'failed'))
);

-- 2. Create indexes for efficient queries
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_photo_sessions_session_id
  ON photo_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_photo_sessions_created_at
  ON photo_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photo_sessions_email
  ON photo_sessions(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_photo_sessions_upload_status
  ON photo_sessions(upload_status);

-- 3. Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE photo_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- ----------------------------------------------------------------------------

-- Policy: Allow anonymous users to INSERT new sessions
-- This allows the photobooth app to save sessions without authentication
DROP POLICY IF EXISTS "Allow anonymous inserts" ON photo_sessions;
CREATE POLICY "Allow anonymous inserts" ON photo_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Prevent public reads (only service role can query)
-- This prevents users from viewing other people's photos
DROP POLICY IF EXISTS "Service role only reads" ON photo_sessions;
CREATE POLICY "Service role only reads" ON photo_sessions
  FOR SELECT
  USING (false);

-- Policy: Allow updates to existing sessions (for email updates)
-- This allows the app to update the email field after initial upload
DROP POLICY IF EXISTS "Allow session updates" ON photo_sessions;
CREATE POLICY "Allow session updates" ON photo_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Storage Bucket Configuration
-- ============================================================================
-- The following should be run if you need to configure your storage bucket.
-- If you've already created the 'photobooth-images' bucket, you may need to
-- update its settings.
-- ============================================================================

-- 5. Ensure the bucket is public (allows direct URL access to images)
-- ----------------------------------------------------------------------------
-- Run this if your bucket needs to be made public:
UPDATE storage.buckets
SET public = true
WHERE name = 'photobooth-images';

-- 6. Create storage policies (if needed)
-- ----------------------------------------------------------------------------
-- These policies allow public read access and authenticated uploads

-- Policy: Allow public to view images (GET requests)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photobooth-images');

-- Policy: Allow anyone to upload to photobooth-images bucket
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
CREATE POLICY "Public upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photobooth-images');

-- Policy: Allow upserts (overwrite) for the same file
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
CREATE POLICY "Public update access"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photobooth-images')
  WITH CHECK (bucket_id = 'photobooth-images');

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify everything is set up correctly
-- ============================================================================

-- Check if table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_sessions'
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'photo_sessions';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'photo_sessions';

-- Check policies exist
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'photo_sessions';

-- Check bucket settings
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'photobooth-images';

-- ============================================================================
-- Test Queries (Optional)
-- ============================================================================
-- These are sample queries you can use to test and monitor your data
-- ============================================================================

-- View all sessions (as service role)
-- SELECT * FROM photo_sessions ORDER BY created_at DESC LIMIT 10;

-- Count total sessions
-- SELECT COUNT(*) as total_sessions FROM photo_sessions;

-- Count sessions by orientation
-- SELECT orientation, COUNT(*) as count
-- FROM photo_sessions
-- GROUP BY orientation;

-- Count sessions with emails
-- SELECT
--   COUNT(*) as total_sessions,
--   COUNT(email) as sessions_with_email,
--   ROUND(COUNT(email) * 100.0 / COUNT(*), 2) as email_rate
-- FROM photo_sessions;

-- View recent uploads
-- SELECT session_id, orientation, created_at, upload_status, email
-- FROM photo_sessions
-- ORDER BY created_at DESC
-- LIMIT 20;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Your Supabase database is now configured for the CUSEC Photobooth app.
-- The app will automatically upload photos and create database records.
-- ============================================================================
