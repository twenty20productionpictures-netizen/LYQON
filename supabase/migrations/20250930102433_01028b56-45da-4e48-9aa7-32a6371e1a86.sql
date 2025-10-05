-- Extended talent profile data
CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  
  -- Physical & Identity Data
  height_feet INTEGER,
  height_inches INTEGER,
  weight INTEGER,
  hair_color TEXT,
  eye_color TEXT,
  ethnicity TEXT[],
  gender_identity TEXT,
  looks_types TEXT[], -- e.g., "Student", "Doctor", "Tired Dad"
  
  -- Skills & Specialization
  languages TEXT[], -- e.g., ["English (Native)", "Spanish (Fluent)", "Russian (Conversational)"]
  instruments TEXT[],
  combat_skills TEXT[],
  athletic_skills TEXT[], -- dance, sports, fitness level
  special_skills TEXT[],
  
  -- Professional Vitals
  union_status TEXT, -- e.g., "SAG-AFTRA", "Non-Union"
  location TEXT,
  agent_name TEXT,
  agent_contact TEXT,
  manager_name TEXT,
  manager_contact TEXT,
  resume_url TEXT,
  
  -- AI Matching Data
  ai_match_score INTEGER DEFAULT 0,
  profile_completion_percentage INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Media Portfolio
CREATE TABLE IF NOT EXISTS public.talent_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'headshot', 'demo_reel', 'voice_clip', 'self_tape'
  media_category TEXT, -- 'Drama', 'Comedy', 'Action' for demo reels
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds for video/audio
  file_size INTEGER, -- in bytes
  is_featured BOOLEAN DEFAULT false,
  ai_analysis_data JSONB, -- AI-generated insights about the media
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Director/Company Profiles
CREATE TABLE IF NOT EXISTS public.director_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  
  -- Company/Agency Details
  company_name TEXT,
  industry_role TEXT, -- "Casting Director", "Producer", "Director"
  website TEXT,
  logo_url TEXT,
  professional_bio TEXT,
  
  -- AI Preference Parameters
  ai_bias_filters JSONB DEFAULT '{"track_ethnicity": true, "track_gender": true, "track_age": true}'::jsonb,
  ai_matching_sensitivity TEXT DEFAULT 'balanced', -- 'strict', 'balanced', 'flexible'
  ai_prioritization JSONB DEFAULT '{"look": 50, "skill": 30, "experience": 20}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Team Management for Directors
CREATE TABLE IF NOT EXISTS public.director_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_profile_id UUID NOT NULL REFERENCES public.director_profiles(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_email TEXT NOT NULL,
  role TEXT NOT NULL, -- "Associate Casting Director", "Assistant", etc.
  permissions JSONB DEFAULT '{"view_candidates": true, "rate_candidates": false, "manage_projects": false}'::jsonb,
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'inactive'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credits/Resume entries for talents
CREATE TABLE IF NOT EXISTS public.talent_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  role_name TEXT NOT NULL,
  project_type TEXT, -- "Feature Film", "TV Series", "Theater", "Commercial"
  production_company TEXT,
  director_name TEXT,
  year INTEGER,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for talent_profiles
CREATE POLICY "Talent profiles are viewable by everyone"
ON public.talent_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own talent profile"
ON public.talent_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own talent profile"
ON public.talent_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for talent_media
CREATE POLICY "Talent media is viewable by everyone"
ON public.talent_media FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage their own talent media"
ON public.talent_media FOR ALL
TO authenticated
USING (
  talent_profile_id IN (
    SELECT id FROM public.talent_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for director_profiles
CREATE POLICY "Director profiles are viewable by everyone"
ON public.director_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own director profile"
ON public.director_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own director profile"
ON public.director_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for director_team_members
CREATE POLICY "Team members viewable by profile owner"
ON public.director_team_members FOR SELECT
TO authenticated
USING (
  director_profile_id IN (
    SELECT id FROM public.director_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own team"
ON public.director_team_members FOR ALL
TO authenticated
USING (
  director_profile_id IN (
    SELECT id FROM public.director_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for talent_credits
CREATE POLICY "Talent credits are viewable by everyone"
ON public.talent_credits FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage their own credits"
ON public.talent_credits FOR ALL
TO authenticated
USING (
  talent_profile_id IN (
    SELECT id FROM public.talent_profiles WHERE user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_talent_profiles_updated_at
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_media_updated_at
BEFORE UPDATE ON public.talent_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_director_profiles_updated_at
BEFORE UPDATE ON public.director_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();