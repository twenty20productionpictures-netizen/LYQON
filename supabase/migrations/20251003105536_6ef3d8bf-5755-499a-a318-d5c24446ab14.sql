-- Function to ensure talent profile exists
CREATE OR REPLACE FUNCTION public.ensure_talent_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If user_type is talent, create a talent_profile if it doesn't exist
  IF NEW.user_type = 'talent' THEN
    INSERT INTO public.talent_profiles (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create talent profiles
DROP TRIGGER IF EXISTS ensure_talent_profile_on_profile_insert ON public.profiles;
CREATE TRIGGER ensure_talent_profile_on_profile_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_talent_profile();

-- Create trigger to auto-create talent profiles on update (in case user_type changes)
DROP TRIGGER IF EXISTS ensure_talent_profile_on_profile_update ON public.profiles;
CREATE TRIGGER ensure_talent_profile_on_profile_update
  AFTER UPDATE OF user_type ON public.profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'talent')
  EXECUTE FUNCTION public.ensure_talent_profile();

-- Backfill: Create talent_profiles for existing talent users who don't have one
INSERT INTO public.talent_profiles (user_id)
SELECT user_id 
FROM public.profiles 
WHERE user_type = 'talent'
AND user_id NOT IN (SELECT user_id FROM public.talent_profiles)
ON CONFLICT (user_id) DO NOTHING;