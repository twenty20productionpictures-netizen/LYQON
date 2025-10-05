-- Create triggers to auto-generate notifications

-- Notify talent when they receive a new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Get recipient(s) from conversation
  FOR recipient_id IN 
    SELECT user_id 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
  LOOP
    -- Get sender name
    SELECT full_name INTO sender_name
    FROM profiles
    WHERE user_id = NEW.sender_id;
    
    -- Create notification
    INSERT INTO notifications (user_id, type, title, content, link)
    VALUES (
      recipient_id,
      'message',
      'New Message',
      sender_name || ' sent you a message',
      '/messages'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Notify directors when talent applies
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  director_id uuid;
  talent_name text;
  project_title text;
BEGIN
  -- Get director and project info
  SELECT p.director_id, p.title INTO director_id, project_title
  FROM projects p
  WHERE p.id = NEW.project_id;
  
  -- Get talent name
  SELECT full_name INTO talent_name
  FROM profiles
  WHERE user_id = NEW.talent_id;
  
  -- Create notification for director
  INSERT INTO notifications (user_id, type, title, content, link)
  VALUES (
    director_id,
    'application',
    'New Application',
    talent_name || ' applied for ' || project_title,
    '/projects'
  );
  
  -- Create confirmation notification for talent
  INSERT INTO notifications (user_id, type, title, content, link)
  VALUES (
    NEW.talent_id,
    'application',
    'Application Submitted',
    'Your application for ' || project_title || ' has been received',
    '/projects'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_application
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_application();