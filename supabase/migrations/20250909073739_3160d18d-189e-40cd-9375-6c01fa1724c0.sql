-- Create security definer function to check if user is a listener
-- This prevents RLS recursion issues when checking roles
CREATE OR REPLACE FUNCTION public.is_listener(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role = 'listener'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view waiting chat requests" ON public.chat_requests;

-- Create new secure policy that only allows:
-- 1. Users to view their own chat requests
-- 2. Listeners to view waiting chat requests (but not personal details of completed ones)
CREATE POLICY "Secure chat request access" ON public.chat_requests
FOR SELECT USING (
  -- Users can always see their own requests
  user_id = auth.uid() 
  OR 
  -- Listeners can only see waiting requests (not personal details of completed ones)
  (status = 'waiting' AND public.is_listener(auth.uid()))
);