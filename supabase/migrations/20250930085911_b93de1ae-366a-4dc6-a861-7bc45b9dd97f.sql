-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can insert conversations" ON public.conversations;

-- Create simplified policy that checks for authenticated user
CREATE POLICY "Allow authenticated users to create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);