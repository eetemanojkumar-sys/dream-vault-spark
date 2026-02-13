
-- Create dream_reactions table for emoji reactions
CREATE TABLE public.dream_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('🔥', '❤️', '🌟', '💡', '🎯', '💪')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dream_id, user_id, reaction)
);

-- Enable RLS
ALTER TABLE public.dream_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view reactions on public dreams"
ON public.dream_reactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM dreams WHERE dreams.id = dream_reactions.dream_id AND dreams.is_public = true
));

CREATE POLICY "Authenticated users can react to public dreams"
ON public.dream_reactions FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM dreams WHERE dreams.id = dream_reactions.dream_id AND dreams.is_public = true
  )
);

CREATE POLICY "Users can remove their own reactions"
ON public.dream_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Allow inserting notifications from triggers/edge functions
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);
