-- Add public profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- Create follows table
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create dream_likes table
CREATE TABLE public.dream_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id uuid NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, dream_id)
);

-- Create dream_comments table
CREATE TABLE public.dream_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id uuid NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: allow viewing public profiles
CREATE POLICY "Anyone can view public profiles"
ON public.profiles FOR SELECT
USING (is_public = true);

-- Follows policies
CREATE POLICY "Users can view all follows"
ON public.follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);

-- Dream likes policies
CREATE POLICY "Anyone can view likes on public dreams"
ON public.dream_likes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.dreams 
  WHERE dreams.id = dream_likes.dream_id 
  AND dreams.is_public = true
));

CREATE POLICY "Users can view their own likes"
ON public.dream_likes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can like public dreams"
ON public.dream_likes FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.dreams 
    WHERE dreams.id = dream_likes.dream_id 
    AND dreams.is_public = true
  )
);

CREATE POLICY "Users can unlike"
ON public.dream_likes FOR DELETE
USING (auth.uid() = user_id);

-- Dream comments policies
CREATE POLICY "Anyone can view comments on public dreams"
ON public.dream_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.dreams 
  WHERE dreams.id = dream_comments.dream_id 
  AND dreams.is_public = true
));

CREATE POLICY "Authenticated users can comment on public dreams"
ON public.dream_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.dreams 
    WHERE dreams.id = dream_comments.dream_id 
    AND dreams.is_public = true
  )
);

CREATE POLICY "Users can update their own comments"
ON public.dream_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.dream_comments FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for comment updated_at
CREATE TRIGGER update_dream_comments_updated_at
BEFORE UPDATE ON public.dream_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();