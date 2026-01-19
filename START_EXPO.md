# Commands to Start Expo Go

Run these commands in your terminal:

## 1. Load nvm (if using nvm)
```bash
source ~/.nvm/nvm.sh
```

## 2. Navigate to project directory
```bash
cd /Users/mateoament/achuar-dome
```

## 3. Install dependencies (if needed)
```bash
npm install
```

## 4. Start Expo development server
```bash
npx expo start
```

Or use the npm script:
```bash
npm start
```

## 5. Once Expo starts:
- You'll see a QR code in your terminal
- Open the **Expo Go** app on your phone
- Scan the QR code with:
  - **iOS**: Use the Camera app (it will open Expo Go automatically)
  - **Android**: Use the Expo Go app's scanner

## Alternative: Use local Expo CLI
If `npx expo start` doesn't work, you can use the local Expo CLI:
```bash
./node_modules/.bin/expo start
```

## Troubleshooting

### If you get permission errors:
- Make sure Node.js/npm are properly installed via nvm
- Try: `npm config set user $(whoami)`
- Or reinstall npm: `npm install -g npm@latest`

### If Expo Go can't connect:
- Make sure your phone and computer are on the same WiFi network
- Press `s` in the Expo terminal to switch connection mode
- Press `r` to reload the app
- Press `c` to clear cache: `npx expo start -c`

### To stop the server:
- Press `Ctrl + C` in the terminal
