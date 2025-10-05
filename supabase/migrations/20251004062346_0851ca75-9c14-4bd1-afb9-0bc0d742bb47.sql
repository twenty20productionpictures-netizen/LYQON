-- Update the notification trigger to allow @ mentions even in muted conversations
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recipient_id uuid;
  sender_name text;
  recipient_name text;
  is_muted boolean;
  has_mention boolean;
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
    
    -- Get recipient name to check for @ mentions
    SELECT full_name INTO recipient_name
    FROM profiles
    WHERE user_id = recipient_id;
    
    -- Check if message contains @ mention of recipient
    has_mention := NEW.content LIKE '%@' || recipient_name || '%';
    
    -- Send notification if not muted OR if there's an @ mention
    IF NOT is_muted OR has_mention THEN
      SELECT full_name INTO sender_name
      FROM profiles
      WHERE user_id = NEW.sender_id;
      
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        recipient_id,
        'message',
        CASE 
          WHEN has_mention THEN 'You were mentioned'
          ELSE 'New Message'
        END,
        sender_name || ' ' || 
        CASE 
          WHEN has_mention THEN 'mentioned you in a message'
          ELSE 'sent you a message'
        END,
        '/messages'
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;