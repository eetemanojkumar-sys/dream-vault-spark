-- Add public sharing columns to dreams table
ALTER TABLE public.dreams 
ADD COLUMN is_public boolean NOT NULL DEFAULT false,
ADD COLUMN share_token text UNIQUE;

-- Create function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE sql
AS $$
  SELECT encode(gen_random_bytes(16), 'hex')
$$;

-- Update RLS policies to allow public viewing of shared dreams
CREATE POLICY "Anyone can view public dreams by share token"
ON public.dreams FOR SELECT
USING (is_public = true AND share_token IS NOT NULL);

-- Allow viewing milestones for public dreams
CREATE POLICY "Anyone can view milestones for public dreams"
ON public.milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dreams 
    WHERE dreams.id = milestones.dream_id 
    AND dreams.is_public = true 
    AND dreams.share_token IS NOT NULL
  )
);