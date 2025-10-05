-- Create storage bucket for application videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-videos',
  'application-videos',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4']
);

-- Add RLS policies for application videos
CREATE POLICY "Talent can upload their own application videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'application-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view application videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'application-videos');

CREATE POLICY "Talent can delete their own application videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'application-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add video_url column to applications table (nullable for existing records)
ALTER TABLE applications
ADD COLUMN video_url TEXT;