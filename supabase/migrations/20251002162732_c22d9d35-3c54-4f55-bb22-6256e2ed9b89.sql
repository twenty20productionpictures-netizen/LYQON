-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.project_roles CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- Create projects table for casting calls
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  production_company text,
  project_type text NOT NULL,
  description text,
  status text DEFAULT 'open',
  deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create roles table for project casting roles
CREATE TABLE public.project_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  role_name text NOT NULL,
  role_description text,
  requirements jsonb,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  talent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.project_roles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  ai_match_score integer,
  cover_letter text,
  applied_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, talent_id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Directors can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (director_id = auth.uid() AND public.has_role(auth.uid(), 'director'));
CREATE POLICY "Directors can update own projects" ON public.projects FOR UPDATE TO authenticated USING (director_id = auth.uid());
CREATE POLICY "Directors can delete own projects" ON public.projects FOR DELETE TO authenticated USING (director_id = auth.uid());

CREATE POLICY "Project roles viewable by everyone" ON public.project_roles FOR SELECT USING (true);
CREATE POLICY "Directors can manage roles for their projects" ON public.project_roles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND director_id = auth.uid()));

CREATE POLICY "Talent can view own applications" ON public.applications FOR SELECT TO authenticated USING (talent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND director_id = auth.uid()));
CREATE POLICY "Talent can create applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (talent_id = auth.uid() AND public.has_role(auth.uid(), 'talent'));
CREATE POLICY "Talent can update own applications" ON public.applications FOR UPDATE TO authenticated USING (talent_id = auth.uid());
CREATE POLICY "Directors can update applications for their projects" ON public.applications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND director_id = auth.uid()));

-- Triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_projects_director ON public.projects(director_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_roles_project ON public.project_roles(project_id);
CREATE INDEX idx_applications_talent ON public.applications(talent_id);
CREATE INDEX idx_applications_project ON public.applications(project_id);
CREATE INDEX idx_applications_status ON public.applications(status);