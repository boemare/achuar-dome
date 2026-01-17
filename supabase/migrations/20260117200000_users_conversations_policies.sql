-- RLS policies for users and conversations tables
-- Allow public access for MVP - can be restricted later

-- Users table policies
CREATE POLICY "Allow public read access to users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to users"
ON users FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from users"
ON users FOR DELETE
USING (true);

-- Conversations table policies
CREATE POLICY "Allow public read access to conversations"
ON conversations FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to conversations"
ON conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to conversations"
ON conversations FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from conversations"
ON conversations FOR DELETE
USING (true);

-- Messages table policies
CREATE POLICY "Allow public read access to messages"
ON messages FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to messages"
ON messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to messages"
ON messages FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from messages"
ON messages FOR DELETE
USING (true);

-- Species table policies
CREATE POLICY "Allow public read access to species"
ON species FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to species"
ON species FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to species"
ON species FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete from species"
ON species FOR DELETE
USING (true);
