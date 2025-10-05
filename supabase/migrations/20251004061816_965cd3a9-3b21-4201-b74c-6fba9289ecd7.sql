-- Add archived column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add muted column to conversation_participants table
ALTER TABLE public.conversation_participants 
ADD COLUMN IF NOT EXISTS muted BOOLEAN DEFAULT false;

-- Update the notification trigger to respect mute status
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recipient_id uuid;
  sender_name text;
  is_muted boolean;
BEGIN
  FOR recipient_id IN 
    SELECT user_id 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
  LOOP
    -- Check if conversation is muted for this recipient
    SELECT muted INTO is_muted
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id 
    AND user_id = recipient_id;
    
    -- Only send notification if not muted
    IF NOT is_muted THEN
      SELECT full_name INTO sender_name
      FROM profiles
      WHERE user_id = NEW.sender_id;
      
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        recipient_id,
        'message',
        'New Message',
        sender_name || ' sent you a message',
        '/messages'
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;