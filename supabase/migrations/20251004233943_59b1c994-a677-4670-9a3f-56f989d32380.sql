-- Create auditions table
CREATE TABLE public.auditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.project_roles(id) ON DELETE SET NULL,
  talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  role_description TEXT NOT NULL,
  emotional_keywords TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audition_evaluations table
CREATE TABLE public.audition_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audition_id UUID NOT NULL REFERENCES public.auditions(id) ON DELETE CASCADE,
  overall_match_score NUMERIC(5,2) NOT NULL CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
  recommendation TEXT NOT NULL CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'probably_not', 'no')),
  emotions_detected JSONB NOT NULL DEFAULT '{}',
  strengths TEXT[],
  improvements TEXT[],
  technical_notes TEXT[],
  detailed_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audition_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auditions
CREATE POLICY "Talent can view their own auditions"
  ON public.auditions FOR SELECT
  USING (auth.uid() = talent_id);

CREATE POLICY "Talent can create auditions"
  ON public.auditions FOR INSERT
  WITH CHECK (auth.uid() = talent_id);

CREATE POLICY "Directors can view auditions for their projects"
  ON public.auditions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = auditions.project_id
      AND projects.director_id = auth.uid()
    )
  );

CREATE POLICY "Directors can update audition status for their projects"
  ON public.auditions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = auditions.project_id
      AND projects.director_id = auth.uid()
    )
  );

-- RLS Policies for audition_evaluations
CREATE POLICY "Talent can view evaluations of their auditions"
  ON public.audition_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auditions
      WHERE auditions.id = audition_evaluations.audition_id
      AND auditions.talent_id = auth.uid()
    )
  );

CREATE POLICY "Directors can view evaluations for their projects"
  ON public.audition_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auditions
      JOIN public.projects ON projects.id = auditions.project_id
      WHERE auditions.id = audition_evaluations.audition_id
      AND projects.director_id = auth.uid()
    )
  );

CREATE POLICY "System can create evaluations"
  ON public.audition_evaluations FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_auditions_project_id ON public.auditions(project_id);
CREATE INDEX idx_auditions_talent_id ON public.auditions(talent_id);
CREATE INDEX idx_audition_evaluations_audition_id ON public.audition_evaluations(audition_id);

-- Trigger for updated_at
CREATE TRIGGER update_auditions_updated_at
  BEFORE UPDATE ON public.auditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for audition videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('audition-videos', 'audition-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload audition videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audition-videos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view audition videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audition-videos');

CREATE POLICY "Users can update their own audition videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'audition-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own audition videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audition-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );