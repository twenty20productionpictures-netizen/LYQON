-- Drop and recreate the conversations insert policy
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);