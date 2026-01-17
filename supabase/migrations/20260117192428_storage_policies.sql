-- Storage policies for the media bucket
-- Allow anyone to upload files (for MVP - can be restricted later)

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to all files in media bucket
CREATE POLICY "Public read access for media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow anyone to upload files to media bucket
CREATE POLICY "Allow uploads to media bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Allow users to update their own files
CREATE POLICY "Allow updates to media bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media');

-- Allow users to delete files
CREATE POLICY "Allow deletes from media bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');
