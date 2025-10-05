-- Add emotions array to project_roles table
ALTER TABLE public.project_roles
ADD COLUMN emotions text[] DEFAULT '{}';

-- Add audio_url to applications table
ALTER TABLE public.applications
ADD COLUMN audio_url text;