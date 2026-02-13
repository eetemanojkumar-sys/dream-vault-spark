
-- Replace the overly permissive notifications insert policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Allow authenticated users to create notifications (system creates on behalf of users)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
