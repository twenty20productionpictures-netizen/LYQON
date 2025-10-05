-- Add selected_talent_id column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS selected_talent_id uuid;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_selected_talent 
ON public.projects(selected_talent_id);