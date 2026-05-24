-- Allow anon users to upload to thumbnails bucket
CREATE POLICY "anon_insert_thumbnails"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'thumbnails');

-- Allow anon users to update (upsert) existing thumbnails
CREATE POLICY "anon_update_thumbnails"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'thumbnails');
