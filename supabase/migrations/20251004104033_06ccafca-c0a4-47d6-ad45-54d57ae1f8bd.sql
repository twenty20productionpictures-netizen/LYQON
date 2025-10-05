-- Add new fields to projects table for enhanced project details
ALTER TABLE public.projects
ADD COLUMN shoot_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN shoot_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN location TEXT,
ADD COLUMN remote_auditions_only BOOLEAN DEFAULT false,
ADD COLUMN mood_board_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN is_draft BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.shoot_start_date IS 'Start date of the shoot/production timeline';
COMMENT ON COLUMN public.projects.shoot_end_date IS 'End date of the shoot/production timeline';
COMMENT ON COLUMN public.projects.location IS 'City/Region for the project shoot';
COMMENT ON COLUMN public.projects.remote_auditions_only IS 'Whether only remote auditions are accepted';
COMMENT ON COLUMN public.projects.mood_board_urls IS 'Array of URLs for mood boards, references, script sides, etc.';
COMMENT ON COLUMN public.projects.is_draft IS 'Whether the project is in draft status or actively posted';