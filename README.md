# Domo Achuar

Wildlife monitoring app for the Achuar community in Ecuador.

## Features

- **3-Tab Navigation**: Map, Gallery, Chat (Snapchat-style swipe)
- **Voice Recording**: Record stories, songs, and cultural knowledge
- **AI Chat**: Ask questions about wildlife, enriched by community knowledge
- **Map View**: See camera locations and animal sightings
- **Elder Mode**: Access to sensitive events (boats, humans, illegal logging)

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app on your phone
```

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [Development Setup](docs/SETUP.md)
- [Tutorials](docs/tutorials/)

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: Perplexity/Gemini API
- **Maps**: React Native Maps

## Project Structure

```
achuar/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens (Map, Gallery, Chat)
│   ├── services/       # API calls (Supabase, AI)
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript types
├── docs/               # Documentation
├── supabase/           # Supabase config & migrations
└── assets/             # Images, fonts, icons
```

## 2-Week Sprint Plan

### Week 1
- Day 1-2: Setup + 3-tab navigation
- Day 3-4: Gallery screen
- Day 5-6: Voice recording
- Day 7: Supabase integration

### Week 2
- Day 8-9: Chat + AI
- Day 10-11: Map with pins
- Day 12: Elder pattern lock
- Day 13-14: Testing + APK

## Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_key
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test on device with Expo Go
4. Submit a pull request

## License

MIT
