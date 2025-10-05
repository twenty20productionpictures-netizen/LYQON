-- Delete all existing applications that don't have a video
DELETE FROM applications
WHERE video_url IS NULL;

-- Now make video_url required for all future applications
ALTER TABLE applications
ALTER COLUMN video_url SET NOT NULL;