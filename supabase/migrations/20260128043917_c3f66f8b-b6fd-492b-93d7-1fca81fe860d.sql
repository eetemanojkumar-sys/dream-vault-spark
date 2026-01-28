-- Create storage bucket for dream images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dreams', 'dreams', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to dream images
CREATE POLICY "Dream images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'dreams');

-- Allow authenticated users to upload their own dream images
CREATE POLICY "Users can upload dream images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dreams' AND auth.uid() IS NOT NULL);

-- Allow users to update their own dream images
CREATE POLICY "Users can update dream images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dreams' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own dream images
CREATE POLICY "Users can delete dream images"
ON storage.objects FOR DELETE
USING (bucket_id = 'dreams' AND auth.uid() IS NOT NULL);