-- Drop and recreate the INSERT policy with explicit role targeting
DROP POLICY IF EXISTS "Allow authenticated users to create conversations" ON public.conversations;

CREATE POLICY "Enable insert for authenticated users"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);