-- Add metric system columns for height and weight
ALTER TABLE public.talent_profiles 
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS weight_kg integer;

-- Add comments for clarity
COMMENT ON COLUMN public.talent_profiles.height_cm IS 'Height in centimeters';
COMMENT ON COLUMN public.talent_profiles.weight_kg IS 'Weight in kilograms';