-- Drop existing policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversations;

-- Create policy without role restriction (applies to all roles that pass the check)
CREATE POLICY "conversations_insert_policy"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);