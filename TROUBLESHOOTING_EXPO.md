# Expo Go Troubleshooting Guide

## Quick Fixes (Try These First)

### 1. Clear Cache and Restart
```bash
cd /Users/mateoament/achuar-dome
source ~/.nvm/nvm.sh
npx expo start -c
```

### 2. Kill Existing Expo Processes
```bash
# Kill any process using port 8081
lsof -ti:8081 | xargs kill

# Or kill all node processes (be careful!)
killall node

# Then restart
npx expo start
```

### 3. Reinstall Dependencies
```bash
cd /Users/mateoament/achuar-dome
rm -rf node_modules package-lock.json
npm install
npx expo start
```

## Common Errors and Solutions

### Error: "Port 8081 is already in use"
**Solution:**
```bash
# Option 1: Use a different port
npx expo start --port 8082

# Option 2: Kill the process using port 8081
lsof -ti:8081 | xargs kill
npx expo start
```

### Error: "babel-preset-expo is not installed"
**Solution:**
```bash
npm install
# Or specifically:
npm install babel-preset-expo
```

### Error: "Cannot find module" or "Module not found"
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### Error: Syntax errors or TypeScript errors
**Solution:**
1. Check the error message - it will tell you which file has the problem
2. Fix the syntax error
3. Restart Expo

### Error: "Metro bundler" errors
**Solution:**
```bash
npx expo start -c
# Or:
watchman watch-del-all  # If you have watchman installed
npm start -- --reset-cache
```

### Error: App crashes immediately on Expo Go
**Possible causes:**
1. Missing environment variables (check .env file)
2. Syntax error in code
3. Missing dependencies

**Solution:**
```bash
# Check for syntax errors
npx tsc --noEmit

# Make sure .env file exists with required variables
cat .env

# Clear cache and restart
npx expo start -c
```

## Step-by-Step Restart Process

1. **Stop any running Expo processes:**
   ```bash
   # Press Ctrl+C in terminal where Expo is running
   # Or kill the process:
   lsof -ti:8081 | xargs kill
   ```

2. **Navigate to project:**
   ```bash
   cd /Users/mateoament/achuar-dome
   ```

3. **Load nvm (if using nvm):**
   ```bash
   source ~/.nvm/nvm.sh
   ```

4. **Clear cache:**
   ```bash
   npx expo start -c
   ```

5. **If that doesn't work, reinstall:**
   ```bash
   rm -rf node_modules .expo
   npm install
   npx expo start
   ```

## Check Your Setup

### Verify Node.js is working:
```bash
node --version  # Should be 18.x or higher
npm --version
```

### Verify dependencies are installed:
```bash
ls node_modules | head -10  # Should show many folders
```

### Check for TypeScript errors:
```bash
npx tsc --noEmit
```

### Verify .env file exists:
```bash
cat .env
# Should show:
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
# EXPO_PUBLIC_AI_API_KEY=...
```

## Still Not Working?

1. **Check the exact error message** - copy and paste it
2. **Check if Expo Go app is installed** on your phone
3. **Make sure phone and computer are on same WiFi**
4. **Try using tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

## Need More Help?

Share the exact error message you're seeing, and I can help you fix it!
