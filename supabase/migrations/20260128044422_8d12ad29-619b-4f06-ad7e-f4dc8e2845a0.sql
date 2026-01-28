-- Fix function search path for generate_share_token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT encode(extensions.gen_random_bytes(16), 'hex')
$$;