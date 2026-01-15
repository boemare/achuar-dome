# Development Setup Guide

This guide will help you set up your development environment for the Domo Achuar app.

## 1. Install Required Tools

### Node.js (v18 or higher)
Download from: https://nodejs.org

Verify installation:
```bash
node --version  # Should be 18.x or higher
npm --version
```

### VS Code
Download from: https://code.visualstudio.com

### VS Code Extensions (Install these!)
1. **ES7+ React/Redux/React-Native snippets** - Code shortcuts
2. **Prettier - Code formatter** - Auto-format code
3. **ESLint** - Find code errors
4. **React Native Tools** - Debug React Native
5. **Expo Tools** - Expo integration

### Expo Go App (on your phone)
- **iOS**: Search "Expo Go" in App Store
- **Android**: Search "Expo Go" in Play Store

### Git
Download from: https://git-scm.com

---

## 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/achuar-dome.git
cd achuar-dome
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Set Up Supabase

### Create a Supabase Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Name it: `achuar-dome`
5. Choose a region close to Ecuador (e.g., South America)
6. Set a database password (save it!)
7. Wait for project to be created

### Get Your API Keys
1. Go to Project Settings > API
2. Copy:
   - **Project URL** (starts with `https://`)
   - **anon public** key

### Create Environment File
Create a file called `.env` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 5. Run the App

```bash
npx expo start
```

This will show a QR code in your terminal.

### On Your Phone
1. Open Expo Go app
2. Scan the QR code
3. The app will load on your phone!

### On Android Emulator (optional)
1. Install Android Studio
2. Create a virtual device (Pixel 4 recommended)
3. Start the emulator
4. Press `a` in the terminal where Expo is running

---

## 6. Project Structure Explained

```
achuar/
├── App.tsx              # Main app entry point
├── src/
│   ├── components/      # Reusable pieces (buttons, cards, etc.)
│   ├── screens/         # Full screens (MapScreen, GalleryScreen, ChatScreen)
│   ├── services/        # API calls (supabase.ts, ai.ts)
│   ├── hooks/           # Custom hooks (useAuth, useRecording)
│   └── types/           # TypeScript type definitions
├── docs/                # Documentation (you're reading it!)
└── supabase/            # Database migrations and functions
```

---

## 7. Learning Resources

### Week 1: Basics
| Topic | Link | Time |
|-------|------|------|
| Expo Tutorial | https://docs.expo.dev/tutorial/introduction/ | 3h |
| React Native Basics | https://reactnative.dev/docs/getting-started | 2h |

### Week 2: Features
| Topic | Link | Time |
|-------|------|------|
| Supabase + React Native | https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native | 2h |
| React Navigation | https://reactnavigation.org/docs/getting-started | 2h |
| Audio Recording (Expo AV) | https://docs.expo.dev/versions/latest/sdk/av/ | 1h |

---

## 8. Common Commands

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start -c

# Install a new package
npx expo install package-name

# Build APK for Android
eas build -p android --profile preview
```

---

## 9. Troubleshooting

### "Metro bundler" errors
```bash
npx expo start -c
```

### Package not found
```bash
npm install
```

### Expo Go can't connect
- Make sure phone and computer are on same WiFi
- Try pressing `s` to switch to Expo Go mode

### TypeScript errors
- Check `src/types/` for type definitions
- Make sure imports are correct

---

## 10. Need Help?

1. Check the [PRD](./PRD.md) for feature requirements
2. Google the error message
3. Check Expo docs: https://docs.expo.dev
4. Ask your supervisor

Good luck! You've got this!
