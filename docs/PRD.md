# Achuar Dome Project

---

# PART 1: GitHub Repository Setup Plan

## Repository Structure

```
achuar-dome/
├── README.md                    # Project overview, quick start
├── docs/
│   ├── PRD.md                   # Product Requirements Document
│   ├── SETUP.md                 # Development environment setup
│   ├── ARCHITECTURE.md          # Technical architecture details
│   └── tutorials/
│       ├── 01-react-native-basics.md
│       ├── 02-expo-guide.md
│       ├── 03-supabase-setup.md
│       └── 04-useful-resources.md
├── src/                         # React Native app source code
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── ...
├── supabase/                    # Supabase configuration
│   ├── migrations/
│   └── functions/
├── assets/                      # Images, icons, fonts
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── app.json                     # Expo configuration
├── package.json
└── .gitignore
```

---

## Development Tools for Intern

### Essential Tools to Install

| Tool | Purpose | Install |
|------|---------|---------|
| **Node.js 18+** | JavaScript runtime | https://nodejs.org |
| **VS Code** | Code editor | https://code.visualstudio.com |
| **Expo Go** (phone) | Test app on device | App Store / Play Store |
| **Android Studio** | Android emulator | https://developer.android.com/studio |
| **Git** | Version control | https://git-scm.com |

### VS Code Extensions

```
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- React Native Tools
- GitLens
- Expo Tools
```

---

## 2-WEEK SPRINT PLAN (MVP Focus)

### Day 1-2: Setup & Learning (Intern)
**Morning**: Environment setup + Expo tutorial
**Afternoon**: Build first "Hello World" React Native app

| Task | Resource | Time |
|------|----------|------|
| Install tools | See list above | 1h |
| Expo Tutorial | [Expo Docs](https://docs.expo.dev/tutorial/introduction/) | 3h |
| Supabase + Expo | [Quickstart](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native) | 2h |

### Day 3-4: Navigation & Structure
- Set up 3-tab navigation (swipeable)
- Create screen placeholders (Map, Gallery, Chat)
- Add floating voice button UI

### Day 5-6: Gallery Screen
- Photo/video grid layout
- Audio card with waveform placeholder
- Tap to view full screen
- Pull from Supabase storage

### Day 7-8: Voice Recording
- Big record button functionality
- Save audio to Supabase storage
- Playback with simple waveform
- Speech-to-text transcription

### Day 9-10: Chat Screen
- Message bubble UI (Snapchat-style)
- Voice input for questions
- Connect to Perplexity/Gemini API
- Display AI responses

### Day 11-12: Map Screen
- Satellite map with pins
- Camera locations
- Tap pin → show photo/video
- Elder vs General content filtering

### Day 13-14: Polish & Deploy
- Pattern lock for Elder login
- Test on Android device
- Fix critical bugs
- Build APK

---

## MVP Features (2 weeks) vs Later

| Feature | MVP (2 weeks) | Later |
|---------|---------------|-------|
| 3-tab swipe navigation | ✅ | |
| Gallery with photos/videos | ✅ | |
| Voice recording + playback | ✅ | |
| Basic chat with AI | ✅ | |
| Map with pins | ✅ | |
| Pattern lock (Elder) | ✅ | |
| RAG enrichment | Simple | Full |
| Waveform visualization | Basic | Animated |
| Offline support | | ✅ |
| Camera live feed | | ✅ |
| Push notifications | | ✅ |
| MegaDetector integration | | ✅ |

---

## Quick Reference Tutorials

| Need | Resource |
|------|----------|
| Swipe tabs | [React Navigation Material Top Tabs](https://reactnavigation.org/docs/material-top-tab-navigator/) |
| Audio recording | [Expo AV Recording](https://docs.expo.dev/versions/latest/sdk/av/#recording-sounds) |
| Speech-to-text | [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/) |
| Supabase storage | [Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart) |
| Maps | [React Native Maps](https://github.com/react-native-maps/react-native-maps) |
| Gemini API | [Gemini Quickstart](https://ai.google.dev/gemini-api/docs/quickstart) |

---

## GitHub Issues (2-Week Sprint)

### Week 1: Core App
- [ ] **Day 1-2**: Project setup + 3-tab navigation
- [ ] **Day 3-4**: Gallery screen with grid layout
- [ ] **Day 5-6**: Voice recording + playback
- [ ] **Day 7**: Supabase integration (storage + database)

### Week 2: Features + Polish
- [ ] **Day 8-9**: Chat screen + AI integration
- [ ] **Day 10-11**: Map screen with pins
- [ ] **Day 12**: Elder pattern lock + role filtering
- [ ] **Day 13-14**: Testing + APK build

---

## Files to Create in Repository

### 1. README.md
```markdown
# 🦎 Domo Achuar

Wildlife monitoring app for the Achuar community in Ecuador.

## Quick Start

1. Install dependencies: `npm install`
2. Start Expo: `npx expo start`
3. Scan QR code with Expo Go app

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Development Setup](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Tutorials](docs/tutorials/)

## Tech Stack

- React Native + Expo
- Supabase (database, auth, storage)
- Perplexity/Gemini API (AI)
```

### 2. docs/SETUP.md
Development environment setup guide for the intern.

### 3. docs/tutorials/
Step-by-step guides for each major feature.

---

## Commands to Initialize Repository

```bash
# 1. Create GitHub repo
gh repo create achuar-dome --public --description "Wildlife monitoring app for Achuar community"

# 2. Initialize Expo project
npx create-expo-app achuar-dome --template blank-typescript
cd achuar-dome

# 3. Install key dependencies
npx expo install @supabase/supabase-js
npx expo install expo-av expo-speech expo-notifications
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-maps

# 4. Create folder structure
mkdir -p docs/tutorials src/components src/screens src/services supabase/migrations

# 5. Copy PRD
cp /path/to/PRD-Achuar-Dome.md docs/PRD.md

# 6. Initial commit
git add .
git commit -m "Initial project setup with Expo and documentation"
git push origin main
```

---

# PART 2: PRD (Product Requirements Document)

---

# PRD: Achuar Geometric Dome - Wildlife Monitoring App

**Document Purpose**: Product Requirements Document for developers to implement the Achuar Geometric Dome wildlife monitoring Android application.

**Last Updated**: January 2026

---

## Executive Summary

Android-first wildlife monitoring application for the Achuar community in Ecuador, integrating trail camera footage with AI-powered species identification, cultural knowledge preservation, and illegal logging detection.

### Core Design Principles

| Principle | Implementation |
|-----------|----------------|
| **3 Tabs Only** | Map, Gallery, Chat - swipe or tap to navigate (Snapchat-style) |
| **Gallery = Home** | Photos + Videos + Audio recordings all in one place |
| **Big Voice Button** | Always visible, one tap to record knowledge |
| **Voice-First** | No typing required - speak to ask questions or add knowledge |
| **Child-Simple UI** | Designed for non-technical users. Large buttons, icons over text |
| **RAG-Enriched AI** | Community voice recordings automatically enrich AI responses |
| **2 Roles** | Elder (see sensitive events) vs General (educational only) |
| **No Firebase** | Supabase only for backend, auth, storage, and realtime |

**Key Strategy for Minimizing Development Work:**
- Use **Supabase only** (PostgreSQL, auth, storage, real-time, edge functions) - no Firebase
- Use **Supabase Realtime** + local Android notifications (no FCM dependency)
- Use **MegaDetector V6** (open source) for animal/human/boat detection - no API costs
- Use **Android native Speech-to-Text** for voice recordings (free, works offline)
- Use **Perplexity/Gemini API** for species facts + RAG enrichment
- Use **iNaturalist API** for species verification (free)
- Use **React Native** for Android app
- Leverage existing Ecuador species data from iNaturalist/GBIF

---

## 0. Deep Audience Analysis

### Who Are the Achuar?

The Achuar are an indigenous people of the Amazon rainforest in Ecuador and Peru. They live in remote communities accessible primarily by small aircraft or river travel. Their culture is deeply rooted in oral tradition, with knowledge passed down through stories, songs, and direct teaching from elders.

### User Personas

#### Persona 1: Elder Knowledge Keeper (María, 65)
- **Tech experience**: Has seen a smartphone, never used one
- **Language**: Achuar primary, some Spanish
- **Goal**: Share stories about animals her grandmother told her
- **Barriers**: Small text, complex menus, typing
- **Need**: Big voice button, speak naturally, hear her recordings played back

#### Persona 2: Community Leader (José, 45)
- **Tech experience**: Uses basic smartphone for calls/WhatsApp
- **Language**: Spanish and Achuar bilingual
- **Goal**: Protect territory from illegal loggers, monitor wildlife
- **Barriers**: Limited time, needs quick actionable info
- **Need**: Map showing threats immediately, one-tap to see footage

#### Persona 3: School Student (Ana, 12)
- **Tech experience**: Some exposure at school, curious
- **Language**: Spanish primary, learning Achuar
- **Goal**: Learn about animals, hear elder stories
- **Barriers**: Gets bored with text, wants visual/audio
- **Need**: Photo gallery, chat to ask questions, play recordings

#### Persona 4: Teacher/Facilitator (Carlos, 35)
- **Tech experience**: Comfortable with smartphones
- **Language**: Spanish, learning Achuar
- **Goal**: Use app as educational tool, encourage knowledge sharing
- **Barriers**: Needs to help others use it
- **Need**: Simple enough to teach in 5 minutes

### Key Design Implications

| Insight | Design Decision |
|---------|-----------------|
| Oral tradition culture | Voice-first everything, preserve audio |
| Limited tech exposure | 3 screens max, swipe navigation (intuitive) |
| Multigenerational use | Large buttons, high contrast, no small text |
| Language | Spanish default, English in settings. Content can be Achuar |
| Remote location | Offline-first, sync when satellite available |
| Shared devices | Simple login at schoolhouse, no complex accounts |
| Elders are respected | Their voice recordings prominently featured |
| Storytelling valued | Chat feels like conversation, not database query |

### Accessibility Requirements

- **Minimum touch target**: 48dp (ideally 64dp)
- **Minimum font size**: 18sp body, 24sp headers
- **Color contrast**: 4.5:1 ratio minimum
- **No reliance on color alone**: Icons + color for status
- **Audio feedback**: Confirmation sounds for actions
- **Offline indicators**: Clear when not connected

---

## 1. Two Permission Levels (Simple)

**Only 2 logins needed:**

| Role | Who | What They See |
|------|-----|---------------|
| **Elder** | Community leaders, elders | Everything including sensitive events (boats, humans, illegal logging) |
| **General** | Students, teachers, community members | Wildlife only (educational) |

### What's Different

| Feature | Elder | General |
|---------|-------|---------|
| Map: Animal sightings | ✅ | ✅ |
| Map: Boat/human activity | ✅ | ❌ |
| Gallery: Animal photos/videos | ✅ | ✅ |
| Gallery: Boat/human footage | ✅ | ❌ |
| Gallery: Voice recordings | ✅ | ✅ |
| Chat: Ask about animals | ✅ | ✅ |
| Voice: Record knowledge | ✅ | ✅ |
| Notifications: Animals | ✅ | ✅ |
| Notifications: Boats/humans | ✅ | ❌ |

### Simple Login

```
┌─────────────────────────────────────────┐
│         🦎 DOMO ACHUAR                  │
│                                         │
│    ┌─────────────────────────────┐      │
│    │  👤 SOY ELDER / I'M ELDER   │      │
│    │     (Full access)           │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │  👥 ENTRAR / ENTER          │      │
│    │     (View animals)          │      │
│    └─────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

- **General login**: One tap, no password needed (for schoolhouse use)
- **Elder login**: Pattern lock (see below)
- **Language**: Spanish by default, English available in settings

### Elder Pattern Lock (No Typing)

**Like old Android pattern lock - connect the dots to unlock**

```
┌─────────────────────────────────────────┐
│         👤 ACCESO ELDER                 │
│                                         │
│         ●───────●───────●               │
│         │       │       │               │
│         │       │       │               │
│         ●───────●───────●               │
│         │       │       │               │
│         │       │       │               │
│         ●───────●───────●               │
│                                         │
│    "Dibuja tu patrón para entrar"       │
│                                         │
└─────────────────────────────────────────┘
```

**Why pattern lock:**
- No typing or numbers required
- Visual/tactile - easy for non-technical users
- Memorable - can be taught by showing once
- Familiar - many have seen this on old phones
- Secure enough for this context

**Implementation:**
- Use React Native Gesture Handler for pattern detection
- Store pattern hash in Supabase (not the pattern itself)
- Show feedback as dots connect (haptic + visual)
- 3x3 grid = simple, 4x4 = more secure if needed

---

## 2. Core Features by Phase

### Phase 1: MVP (Core Functionality)

#### 2.1 Camera Feed Management
- **Live Feed**: RTSP/MJPEG streaming from trail cameras
- **Archived Feed**: Browse recordings by date/camera
- **Metadata Display**: Time, date, temperature, GPS coordinates, camera ID
- **Pre/Post Buffer**: 5-second buffer before and after motion events

#### 2.2 AI-Powered Detection (MegaDetector V6)
- **Classification Categories**: Animals, Humans, Boats, Other
- **Motion Triggers**: Record full duration + capture 3 photos (5-second intervals)
- **Notification System**: Push notifications per category (toggleable on/off)

#### 2.3 Species Identification Flow
```
Motion Detected → MegaDetector classifies (animal/human/boat/other)
       ↓
If Animal → Upload best photo to iNaturalist API
       ↓
Community verification → Species confirmed
       ↓
Store in species database, organized by family
```

#### 2.4 Species Glossary
- Species organized by taxonomic family
- Names in: Spanish, English, Latin, Achuar (community-added)
- Conservation status (from IUCN Red List)
- Link to [Libro Rojo de los Mamíferos del Ecuador](https://bioweb.bio/faunaweb/mammaliaweb/ListaRoja/)
- AI-generated facts (Perplexity API with citations)

#### 2.5 Notifications System
- Toggle notifications for: Animales, Humanos, Botes, Otro
- Species-specific alerts: "Jaguar spotted at Camera 3"
- Illegal logging alerts (leaders only): "Boat activity detected"

### Phase 2: Cultural Knowledge & Advanced Features

#### 2.6 RAG-Powered Knowledge System (No Manual Editors)

**How It Works**: Community voice recordings automatically enrich AI-generated content

```
┌─────────────────────────────────────────────────────────┐
│                    KNOWLEDGE INPUT                       │
│  User records voice → Transcribed → Stored in database  │
│  (Stories, Achuar names, cultural facts, behaviors)     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    RAG ENRICHMENT                        │
│  When displaying species info:                          │
│  1. Perplexity/Gemini generates base facts              │
│  2. RAG retrieves relevant community recordings         │
│  3. AI combines scientific + cultural knowledge         │
│  4. Output includes community voices + citations        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   KNOWLEDGE OUTPUT                       │
│  User sees: AI facts + "La comunidad dice..." section   │
│  Can play original voice recordings inline              │
└─────────────────────────────────────────────────────────┘
```

**Voice Input (Anyone Can Contribute)**:
- Large microphone button on every species page
- "Hablar sobre este animal" - speak about the animal
- Audio saved + auto-transcribed
- No moderation needed - stored as community contribution
- Original audio always preserved for playback

**AI Output (Enriched by Community)**:
- Base facts from Perplexity API (scientific info)
- RAG pulls matching community recordings
- Display shows: "Según la comunidad Achuar: [transcription]"
- Play button to hear original voice recording

**Example Output for "Jaguar"**:
```
🐆 JAGUAR (Panthera onca)
Nombre Achuar: [from community recordings]

📚 Información científica:
"The jaguar is the largest cat in the Americas..."
- Perplexity AI

🎤 Conocimiento de la comunidad:
"Mi abuelo decía que el jaguar..."
[▶️ Escuchar grabación]
- Recorded by community member, 2026
```

**Tech Implementation**:
- Store transcriptions in PostgreSQL with vector embeddings
- Use Supabase pgvector for similarity search
- Query: "Find community recordings related to [species]"
- Gemini/Perplexity combines sources in response

#### 2.7 Behavior Tracking
- Tag recorded behaviors: Alimentación, Movimiento, Apareamiento, Descanso, etc.
- Filter footage by behavior type

#### 2.8 Illegal Logging Module (Leaders Only)
- Archived footage of boats/humans
- Real-time alerts for suspicious activity
- Export reports for authorities

### Phase 3: Future Enhancements

#### 2.9 Satellite Map
- Camera locations with GPS coordinates
- Heatmap of animal sightings
- Species distribution visualization

#### 2.10 Advanced Species Features
- Full species observation history
- Behavior analytics over time
- Community engagement metrics

---

## 3. Technical Architecture

### 3.1 Tech Stack (No Firebase - Supabase Only)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile App** | React Native | Cross-platform, large ecosystem, good offline support |
| **Backend** | Supabase | PostgreSQL, auth, storage, real-time, edge functions |
| **Notifications** | Supabase Realtime + Expo Notifications | No Firebase dependency, works with React Native |
| **AI Detection** | MegaDetector V6 | Free, open source, 95%+ accuracy on camera trap images |
| **Species ID** | iNaturalist API | Free, community verification, Ecuador species database |
| **RAG + Facts** | Perplexity/Gemini API | Facts generation with community knowledge enrichment |
| **Vector Search** | Supabase pgvector | For RAG similarity matching on voice transcriptions |
| **Media Storage** | Supabase Storage | Integrated with database, cheaper than S3 |
| **Camera Streaming** | RTSP via VLC/ExoPlayer | Standard protocol, most trail cams support |

**Notification Architecture (No Firebase):**
```
Camera event → Supabase Edge Function → Insert to notifications table
                                              ↓
                                    Supabase Realtime broadcast
                                              ↓
                               App receives via WebSocket subscription
                                              ↓
                               Expo Notifications shows local notification
```

### 3.2 Open Source Dependencies

| Repository | Purpose | License |
|------------|---------|---------|
| [MegaDetector](https://github.com/agentmorris/MegaDetector) | Animal/human/vehicle detection | MIT |
| [PyTorch Wildlife](https://github.com/microsoft/CameraTraps) | MegaDetector V6 model | MIT |
| [pyinaturalist](https://pyinaturalist.readthedocs.io/) | iNaturalist API client | MIT |
| [AddaxAI](https://addax.ai) | GUI for running MegaDetector (optional) | Open source |

### 3.3 API Cost Estimates (Monthly)

| Service | Usage Estimate | Cost |
|---------|---------------|------|
| Supabase | Free tier (500MB DB, 1GB storage, realtime) | $0 |
| Expo Notifications | Free tier covers small community | $0 |
| iNaturalist | Species verification | $0 |
| Perplexity/Gemini | RAG queries + facts generation | ~$15 |
| **Total** | | **~$15/month** |

*Note: As usage grows, Supabase Pro ($25/mo) may be needed for more storage/bandwidth*

---

## 4. Data Models

### 4.1 Core Tables (Supabase/PostgreSQL)

```sql
-- Users (2 roles only)
users (id, role: enum['elder', 'general'], created_at)
-- Elder: requires password to login
-- General: one-tap login, no password

-- Cameras
cameras (id, name, gps_lat, gps_lng, is_active, last_ping)

-- Observations (motion events)
observations (
  id, camera_id, timestamp,
  detection_type: enum['animal', 'human', 'boat', 'other'],
  temperature, video_url, thumbnail_url,
  megadetector_confidence, is_processed
)

-- Photos (3 per observation)
photos (id, observation_id, url, taken_at, uploaded_to_inaturalist: boolean)

-- Species
species (
  id, scientific_name, common_name_es, common_name_en,
  achuar_name, family, conservation_status,
  libro_rojo_url, inaturalist_taxon_id,
  ai_facts_json, ai_facts_updated_at
)

-- Sightings (verified observations)
sightings (
  id, observation_id, species_id,
  behavior: enum['feeding', 'moving', 'mating', 'resting', 'other'],
  verified_by, verified_at, inaturalist_observation_id
)

-- Community Voice Recordings (RAG Knowledge Base)
voice_recordings (
  id, species_id,
  audio_url,              -- Original voice recording
  transcription,          -- Auto-transcribed text
  embedding vector(1536), -- Vector embedding for RAG similarity search
  duration_seconds,
  recorded_by, recorded_at
)
-- Can contain: stories, songs, elder knowledge, names, anything

-- Enable pgvector extension for RAG
-- CREATE EXTENSION vector;
-- CREATE INDEX ON voice_recordings USING ivfflat (embedding vector_cosine_ops);
```

---

## 5. Key User Flows

### 5.1 Motion Detection → Species Identification

```
1. Camera detects motion
2. Records video (5s before + duration + 5s after)
3. Captures 3 photos at 5-second intervals
4. MegaDetector processes → classifies as animal/human/boat/other
5. If animal:
   a. Best photo uploaded to iNaturalist
   b. Community verifies species
   c. Once confirmed, stored in database by family
   d. Perplexity generates facts (if new species)
6. Push notification sent to subscribed users
```

### 5.2 Cultural Knowledge Submission

```
1. Cultural Editor logs in
2. Navigates to species page
3. Opens "Significado Cultural" section
4. Adds content (stories, Achuar name, TEK)
5. Submits for approval
6. Community Leader reviews and approves
7. Content published to all users
```

### 5.3 Illegal Logging Alert (Leaders Only)

```
1. Camera detects motion
2. MegaDetector classifies as "human" or "boat"
3. Push notification to Community Leaders
4. Leader opens app, views live/archived footage
5. Can export evidence for authorities
```

---

## 6. UI/UX Requirements

### CRITICAL: Design for Non-Technical Users
**Target audience**: Imagine designing for children. Users have minimal smartphone experience. Every interaction must be intuitive without instructions.

---

### 6.1 Snapchat-Inspired Navigation

**Design inspiration**: Snapchat's intuitive swipe + tap navigation

```
        ← SWIPE LEFT                    SWIPE RIGHT →
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │              │  │              │  │              │
    │   🗺️ MAPA   │  │ 📷 GALERÍA  │  │  💬 CHAT    │
    │              │  │   (HOME)     │  │              │
    │              │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
           │                 │                 │
           └────────┬────────┴────────┬────────┘
                    │                 │
              TAP ICON OR SWIPE TO NAVIGATE
```

**Navigation (exactly like Snapchat):**
- **Swipe left/right** to move between screens
- **Tap bottom icons** to jump directly
- **Gallery is home** (center screen - photos, videos, audio)
- **Smooth transitions** with gesture animations

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [CURRENT SCREEN]                     │
│                                                         │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    🎤 GRABAR                            │
│              (Big floating voice button)                │
├───────────────┬───────────────┬─────────────────────────┤
│   🗺️ Mapa    │  📷 Galería  │      💬 Chat            │
│               │    (●)        │                         │
└───────────────┴───────────────┴─────────────────────────┘
        ← swipe                              swipe →
```

**Bottom bar indicators:**
- Dot under active screen (like Snapchat)
- Icons highlight when active
- Subtle haptic feedback on tap

---

### 6.2 Tab 1: MAPA (Map)

**Both roles see a map, but different content:**

| Content | Leaders | Public |
|---------|---------|--------|
| Camera locations | ✅ | ✅ |
| Animal sightings | ✅ | ✅ |
| Boat activity | ✅ | ❌ |
| Human activity | ✅ | ❌ |
| Illegal logging events | ✅ | ❌ |

**Features:**
- Satellite map view (Google Maps / Mapbox)
- Tap pin → see photo/video from that location
- Filter by: animal type, date, camera
- Leaders: Red pins for sensitive events, tap for footage

---

### 6.3 Tab 2: GALERÍA (Photos, Videos & Audio)

**All content in one unified gallery - camera footage AND community recordings**

```
┌─────────────────────────────────────────┐
│  📷 GALERÍA           🔍 Filtrar        │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐               │
│  │ 🦎      │  │ 🎤 ~~~  │  ← Audio card │
│  │ [photo] │  │ "Sobre  │    with       │
│  │         │  │ jaguar" │    waveform   │
│  │ Jaguar  │  │ 2:34    │               │
│  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐               │
│  │ 🐒      │  │ 🎬      │  ← Video      │
│  │ [photo] │  │ [thumb] │               │
│  │         │  │ ▶️ 0:45  │               │
│  │ Mono    │  │ Tapir   │               │
│  └─────────┘  └─────────┘               │
└─────────────────────────────────────────┘
```

**Three content types with visual distinction:**

| Type | Visual | Description |
|------|--------|-------------|
| **📷 Photo** | Camera thumbnail | Still image from trail camera |
| **🎬 Video** | Thumbnail + ▶️ play icon | Motion-triggered recording |
| **🎤 Audio** | Waveform + speaker icon | Community recordings (stories, songs, anything) |

**Audio cards design:**
```
┌─────────────────────────┐
│  🎤  ∿∿∿∿∿∿∿∿∿∿∿∿∿     │  ← Waveform visualization
│  "Historia del jaguar"  │  ← First words (if transcribed)
│  María · 2:34 · Jaguar  │  ← Who, duration, species
│  [▶️ ESCUCHAR]          │  ← Big play button
└─────────────────────────┘
```

**Audio can contain anything:**
- Spoken stories about animals
- Traditional songs
- Elder knowledge
- Achuar names and pronunciation
- Cultural significance

**Content access by role:**

| Content | Leaders | Public |
|---------|---------|--------|
| Animal photos/videos | ✅ | ✅ |
| Community audio recordings | ✅ | ✅ |
| Boat/human photos/videos | ✅ | ❌ |

**Features:**
- **Mixed grid**: Photos, videos, audio all together chronologically
- **Filter by type**: Tap icons to show only photos, only videos, or only audio
- **Filter by species**: "Mostrar solo jaguar"
- **Tap to expand**: Photos/videos full screen, audio plays with large waveform
- **Species link**: Tap species name → opens chat with AI info

---

### 6.4 Tab 3: CHAT (Snapchat-Style Conversations)

**Like chatting with a knowledgeable friend about wildlife**

```
┌─────────────────────────────────────────┐
│  ← Conversaciones                    ⋮  │
├─────────────────────────────────────────┤
│                                         │
│        ┌──────────────────────┐         │
│        │ ¿Qué sabes del       │   YOU   │
│        │ jaguar?              │    🎤   │
│        └──────────────────────┘         │
│                                         │
│  ┌──────────────────────────┐           │
│  │ El jaguar es el felino   │   🦎     │
│  │ más grande de América... │   DOMO   │
│  │                          │           │
│  │ 📚 Ver más información   │           │
│  │ 🎤 Escuchar a la        │           │
│  │    comunidad [▶️]        │           │
│  └──────────────────────────┘           │
│                                         │
│        ┌──────────────────────┐         │
│        │ ¿Y dónde vive?       │   YOU   │
│        └──────────────────────┘         │
│                                         │
├─────────────────────────────────────────┤
│  🎤 Mantén para hablar    📷 Imagen    │
└─────────────────────────────────────────┘
```

**Snapchat-like features:**
- **Message bubbles** - your questions on right, AI on left
- **Conversational flow** - continue asking follow-up questions
- **Hold to speak** - just like Snapchat voice messages
- **Attach image** - "What animal is this?" with photo from gallery
- **Inline audio** - tap to play community voice recordings
- **"Domo"** - friendly AI assistant name (the dome)

**Conversation list (swipe right or tap ← ):**
```
┌─────────────────────────────────────────┐
│  💬 CONVERSACIONES                      │
├─────────────────────────────────────────┤
│  🦎 Sobre el jaguar         Ayer 3:42p │
│  🦎 ¿Qué come el tapir?     Mar 15     │
│  🦎 Animales del río        Mar 12     │
│  🎤 Mi historia del mono    Mar 10     │
└─────────────────────────────────────────┘
```
- Tap conversation to continue where you left off
- Shows both chats and voice recordings you've made

---

### 6.5 Big Voice Button (Always Visible)

**One big button - record anything (stories, songs, knowledge)**

```
        ┌───────────────┐
        │      🎤       │  ← Large, prominent
        │    GRABAR     │
        └───────────────┘
```

**Simple recording flow:**
1. Tap voice button
2. Select animal (large photo grid)
3. Hold to record (or tap to start/stop for longer recordings)
4. Preview playback
5. "¡Grabado!" confirmation

**What people can record:**
- Stories about animals
- Traditional songs
- Elder knowledge
- Achuar names and pronunciation
- Anything they want to share

**View Past Recordings:**
- Long-press voice button → "Mis grabaciones"
- List shows all recordings by this user
- Can play back or delete

---

### 6.6 History & Notes

**Two ways to access past content:**

1. **From Chat tab**: Tap ← or swipe right → see all conversations
2. **From Voice button**: Long-press → "Mis grabaciones"

**Voice search**: Hold mic and say "Buscar jaguar" to find related content

---

### 6.7 Visual Design Principles

**Design for children / non-technical users:**
- **LARGE everything**: Buttons minimum 64dp, text minimum 18sp
- **Icons over text**: Visual cues are primary
- **3 taps max**: To any feature
- **No typing required**: Voice input everywhere
- **High contrast**: Easy to see outdoors

**Color Palette:**
```
Primary: Forest Green (#2D5016) - nature
Background: Cream (#FFF8DC) - easy on eyes
Alerts: Bright Orange (#FF6B00) - attention
Danger (Leaders): Red (#DC143C) - sensitive events
```

---

### 6.8 Onboarding (First-Time Use)

- Animated tutorial with hand pointers
- Voice guidance in Spanish
- Practice: "Graba tu primera nota"
- No text-heavy instructions
- 3 screens max, then into the app

---

## 7. Camera Hardware Integration

**Confirmed**: WiFi/Cellular trail cameras with satellite internet (Starlink or similar)

**Recommended Trail Cameras** (WiFi/cellular capable):
- Stealth Cam Connect Cellular
- Reconyx HyperFire 2 with WiFi module
- Bushnell CelluCORE 30
- Spypoint Link-Micro-S-LTE (good for remote areas)

**Integration Approach**:
1. Cameras connect to satellite WiFi network
2. Upload photos/video directly to Supabase Storage via API
3. Webhook triggers MegaDetector processing (run on cloud function)
4. Results stored in Supabase, push notification sent via FCM

**Bandwidth Optimization** (important for satellite costs):
- Compress videos before upload (H.265/HEVC)
- Upload thumbnails first, full video on-demand
- Process MegaDetector on device if camera supports edge compute
- Batch uploads during off-peak hours
- Configurable quality settings per camera

**Alternative (Phone as Camera for testing)**:
- Use open source [CameraServe](https://github.com/arktronic/cameraserve)
- Android phone streams MJPEG over WiFi

---

## 8. Offline Capabilities

Given remote Amazon location:
- **Cache**: Species glossary, recent sightings
- **Queue**: Cultural knowledge submissions sync when connected
- **Download**: Allow downloading footage for offline viewing
- **Sync**: Opportunistic sync when connectivity available

---

## 9. Implementation Phases

### Phase 1: MVP (8-10 weeks development)
- [ ] Supabase backend setup (auth, database, storage)
- [ ] React Native app scaffold with ultra-simple UI
- [ ] **Voice recording system** (record, save, playback) - CRITICAL
- [ ] Camera feed viewing (live + archive)
- [ ] MegaDetector integration for classification
- [ ] Basic notification system (4 categories)
- [ ] Species glossary with large photo cards
- [ ] Voice notes on species pages
- [ ] Two-tier login (leaders vs community)
- [ ] Animated onboarding tutorial

### Phase 2: Intelligence (4-6 weeks)
- [ ] iNaturalist API integration
- [ ] Perplexity API for species facts
- [ ] Species-specific notifications
- [ ] Behavior tagging system
- [ ] Cultural significance section with moderation

### Phase 3: Advanced (4-6 weeks)
- [ ] Satellite map with camera locations
- [ ] Illegal logging dedicated module
- [ ] Analytics dashboard
- [ ] Export/reporting features

---

## 10. Verification Plan

### Testing Approach
1. **Unit Tests**: API integrations, data models
2. **Device Testing**: Multiple Android versions (7.0+)
3. **Field Testing**:
   - Test with 2-3 cameras in Ecuador
   - Validate offline sync behavior
   - Test push notifications in low connectivity
4. **User Acceptance**:
   - Community leaders test illegal logging alerts
   - School tests species identification flow
   - Elders test cultural knowledge submission

### Success Metrics
- Species identification accuracy >85%
- Notification delivery <30 seconds from detection
- App works offline for core browsing features
- Community contributes >10 cultural entries in first month

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Poor connectivity in Amazon | High | Aggressive caching, offline-first design |
| Camera hardware compatibility | Medium | Test with specific models before deployment |
| MegaDetector accuracy on Amazon species | Medium | Fine-tune with local dataset if needed |
| iNaturalist rate limits | Low | Cache results, batch requests |
| Community adoption | Medium | Spanish-only UI, simple toggles, training sessions |

---

## 12. Resources

### APIs & Documentation
- [iNaturalist API](https://api.inaturalist.org/v1/docs/) - Species verification
- [Perplexity API](https://docs.perplexity.ai/) - Facts generation
- [MegaDetector GitHub](https://github.com/agentmorris/MegaDetector) - Detection model
- [Supabase Docs](https://supabase.com/docs) - Backend
- [Firebase FCM](https://firebase.google.com/docs/cloud-messaging) - Push notifications

### Ecuador Species Data
- [Libro Rojo de los Mamíferos del Ecuador](https://bioweb.bio/faunaweb/mammaliaweb/ListaRoja/)
- [iNaturalist Ecuador Observations](https://www.inaturalist.org/observations?place_id=7512)
- [GBIF Ecuador](https://www.gbif.org/country/EC/summary)

---

## Summary

This PRD outlines a practical, cost-effective approach to building the Achuar Geometric Dome app:

1. **Voice-First Design** - Speak into the phone to add cultural knowledge, no typing required
2. **Child-Simple UI** - Large buttons, icons over text, 3 taps max to any feature
3. **Preserve Oral Tradition** - Audio recordings saved to capture Achuar language pronunciation
4. **Minimal API costs** (~$10/month) using open source AI and free-tier services
5. **Proven technology stack** with React Native + Supabase + Firebase
6. **Leverage existing data** from iNaturalist and Libro Rojo
7. **Phased approach** to manage complexity and get feedback early

The app will serve dual purposes: wildlife conservation monitoring for the broader community and illegal logging detection for community leaders, all while preserving Achuar traditional knowledge through voice recordings for future generations.
