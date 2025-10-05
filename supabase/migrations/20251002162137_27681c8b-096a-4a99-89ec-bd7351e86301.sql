-- Backfill user roles for existing users from profiles table
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.user_id,
  CASE 
    WHEN p.user_type = 'talent' THEN 'talent'::app_role
    WHEN p.user_type = 'director' THEN 'director'::app_role
    ELSE 'talent'::app_role
  END as role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;