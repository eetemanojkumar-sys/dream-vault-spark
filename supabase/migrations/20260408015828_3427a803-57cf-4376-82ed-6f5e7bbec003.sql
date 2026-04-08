
-- Create dream challenges table
CREATE TABLE public.dream_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  category TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT 'trophy',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
ON public.dream_challenges FOR SELECT
USING (true);

-- Create challenge entries table
CREATE TABLE public.challenge_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.dream_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenge entries"
ON public.challenge_entries FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can submit entries"
ON public.challenge_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
ON public.challenge_entries FOR DELETE
USING (auth.uid() = user_id);
