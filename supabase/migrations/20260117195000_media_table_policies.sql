-- RLS policies for media tables (photos, videos, voice_recordings)
-- Allow public access for MVP - can be restricted later

-- Photos table policies
CREATE POLICY "Allow public read access to photos"
ON photos FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to photos"
ON photos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to photos"
ON photos FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from photos"
ON photos FOR DELETE
USING (true);

-- Videos table policies
CREATE POLICY "Allow public read access to videos"
ON videos FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to videos"
ON videos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to videos"
ON videos FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from videos"
ON videos FOR DELETE
USING (true);

-- Voice recordings table policies
CREATE POLICY "Allow public read access to voice_recordings"
ON voice_recordings FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to voice_recordings"
ON voice_recordings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to voice_recordings"
ON voice_recordings FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from voice_recordings"
ON voice_recordings FOR DELETE
USING (true);

-- Observations table policies (for map pins)
CREATE POLICY "Allow public read access to observations"
ON observations FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to observations"
ON observations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to observations"
ON observations FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from observations"
ON observations FOR DELETE
USING (true);
