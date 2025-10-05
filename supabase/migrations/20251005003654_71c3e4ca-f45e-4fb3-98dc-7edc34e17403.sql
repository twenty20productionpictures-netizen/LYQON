-- Create table for completed projects (director's portfolio)
CREATE TABLE IF NOT EXISTS public.completed_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  director_id UUID NOT NULL,
  selected_talent_id UUID NOT NULL,
  project_title TEXT NOT NULL,
  project_type TEXT NOT NULL,
  production_company TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  shortlist_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.completed_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Directors can view their own completed projects
CREATE POLICY "Directors can view own completed projects"
ON public.completed_projects
FOR SELECT
TO authenticated
USING (director_id = auth.uid());

-- Policy: System can insert completed projects
CREATE POLICY "System can insert completed projects"
ON public.completed_projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_completed_projects_director ON public.completed_projects(director_id);
CREATE INDEX idx_completed_projects_talent ON public.completed_projects(selected_talent_id);

-- Create table for talent portfolio entries (selected projects)
CREATE TABLE IF NOT EXISTS public.talent_portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  project_type TEXT NOT NULL,
  production_company TEXT,
  director_name TEXT,
  role_description TEXT,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  match_score INTEGER,
  ai_evaluation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(talent_id, project_id)
);

-- Enable RLS
ALTER TABLE public.talent_portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Talent can view their own portfolio projects
CREATE POLICY "Talent can view own portfolio projects"
ON public.talent_portfolio_projects
FOR SELECT
TO authenticated
USING (talent_id = auth.uid());

-- Policy: Everyone can view public portfolio projects
CREATE POLICY "Public can view portfolio projects"
ON public.talent_portfolio_projects
FOR SELECT
TO authenticated
USING (true);

-- Policy: System can insert portfolio projects
CREATE POLICY "System can insert portfolio projects"
ON public.talent_portfolio_projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_portfolio_projects_talent ON public.talent_portfolio_projects(talent_id);
CREATE INDEX idx_portfolio_projects_selected_at ON public.talent_portfolio_projects(selected_at DESC);