-- Achuar Dome Initial Schema
-- Wildlife monitoring app for the Achuar community

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('elder', 'general')) DEFAULT 'general',
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Species table
CREATE TABLE species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_achuar TEXT,
  category TEXT NOT NULL CHECK (category IN ('mammal', 'bird', 'reptile', 'amphibian', 'fish', 'insect', 'other')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Observations table
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('wildlife', 'boat', 'human', 'other')) DEFAULT 'wildlife',
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  notes TEXT,
  is_restricted BOOLEAN DEFAULT FALSE, -- true for boats/humans (Elder only)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  duration INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice recordings table
CREATE TABLE voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  species_id UUID REFERENCES species(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  duration INTEGER, -- seconds
  transcription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table (for AI chat)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_observations_user ON observations(user_id);
CREATE INDEX idx_observations_species ON observations(species_id);
CREATE INDEX idx_observations_type ON observations(type);
CREATE INDEX idx_observations_location ON observations(latitude, longitude);
CREATE INDEX idx_observations_created ON observations(created_at DESC);
CREATE INDEX idx_photos_observation ON photos(observation_id);
CREATE INDEX idx_videos_observation ON videos(observation_id);
CREATE INDEX idx_voice_recordings_observation ON voice_recordings(observation_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Species: everyone can read
CREATE POLICY "Species are viewable by everyone" ON species
  FOR SELECT USING (true);

-- Observations: restrict boat/human sightings to elders
CREATE POLICY "General users can view non-restricted observations" ON observations
  FOR SELECT USING (
    NOT is_restricted OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'elder')
  );

CREATE POLICY "Users can insert observations" ON observations
  FOR INSERT WITH CHECK (true);

-- Photos/Videos/Voice: follow observation restrictions
CREATE POLICY "Photos follow observation access" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM observations o
      WHERE o.id = photos.observation_id
      AND (NOT o.is_restricted OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'elder'))
    )
  );

CREATE POLICY "Users can insert photos" ON photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Videos follow observation access" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM observations o
      WHERE o.id = videos.observation_id
      AND (NOT o.is_restricted OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'elder'))
    )
  );

CREATE POLICY "Users can insert videos" ON videos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Voice recordings follow observation access" ON voice_recordings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM observations o
      WHERE o.id = voice_recordings.observation_id
      AND (NOT o.is_restricted OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'elder'))
    )
    OR observation_id IS NULL -- standalone recordings
  );

CREATE POLICY "Users can insert voice recordings" ON voice_recordings
  FOR INSERT WITH CHECK (true);

-- Conversations & Messages: user can only see their own
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
  );

-- Users: can read own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert self" ON users
  FOR INSERT WITH CHECK (true);

-- Insert some initial species data
INSERT INTO species (name, name_achuar, category) VALUES
  ('Jaguar', 'Yawa', 'mammal'),
  ('Tapir', 'Pamá', 'mammal'),
  ('Giant River Otter', 'Wankánim', 'mammal'),
  ('Woolly Monkey', 'Chú', 'mammal'),
  ('Harpy Eagle', 'Uunt Pinchu', 'bird'),
  ('Scarlet Macaw', 'Kaáng', 'bird'),
  ('Toucan', 'Tsukankám', 'bird'),
  ('Caiman', 'Yakúm', 'reptile'),
  ('Anaconda', 'Panki', 'reptile'),
  ('Piranha', 'Paña', 'fish'),
  ('Electric Eel', 'Tsunkí', 'fish'),
  ('Blue Morpho Butterfly', 'Wampishuk', 'insect');
