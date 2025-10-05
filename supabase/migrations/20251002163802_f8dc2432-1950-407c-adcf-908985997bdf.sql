-- Add sample conversations for testing
DO $$
DECLARE
  talent_user_id uuid;
  director_user_id uuid;
  conv_id uuid;
BEGIN
  -- Get a talent and director user
  SELECT user_id INTO talent_user_id 
  FROM public.profiles 
  WHERE user_type = 'talent' 
  LIMIT 1;
  
  SELECT user_id INTO director_user_id 
  FROM public.profiles 
  WHERE user_type = 'director' 
  LIMIT 1;
  
  -- Only create sample conversation if both users exist and no conversations exist yet
  IF talent_user_id IS NOT NULL AND director_user_id IS NOT NULL 
     AND NOT EXISTS (SELECT 1 FROM public.conversations LIMIT 1) THEN
    -- Create a conversation
    INSERT INTO public.conversations (id) 
    VALUES (gen_random_uuid()) 
    RETURNING id INTO conv_id;
    
    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (conv_id, talent_user_id),
      (conv_id, director_user_id);
    
    -- Add sample messages
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES 
      (conv_id, director_user_id, 'Hi! I saw your profile and I think you would be perfect for our upcoming project.'),
      (conv_id, talent_user_id, 'Thank you! I would love to hear more about the project.'),
      (conv_id, director_user_id, 'It''s a feature film about a talented actor discovering their passion. Would you be interested in auditioning?');
  END IF;
END $$;