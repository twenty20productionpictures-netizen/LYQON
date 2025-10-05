-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON public.conversation_participants;

-- Create security definer function to check if user is in conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
    AND user_id = _user_id
  )
$$;

-- Create new policies using the security definer function
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants
FOR SELECT
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can add participants to new conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  public.is_conversation_participant(conversation_id, auth.uid())
  OR NOT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
  )
);