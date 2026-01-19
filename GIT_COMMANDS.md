# How to Save Progress to GitHub

## Quick Commands (Copy & Paste)

```bash
# 1. Navigate to project
cd /Users/mateoament/achuar-dome

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "Add chatbot functionality with Gemini API and voice button visibility"

# 4. Push to GitHub
git push origin Mateo_chatbot
```

## Step-by-Step Explanation

### Step 1: Check what changed
```bash
git status
```
This shows you what files have been modified.

### Step 2: Add files to staging
```bash
# Add all changes
git add .

# Or add specific files
git add App.tsx src/screens/chat/ChatScreen.tsx
```

### Step 3: Commit your changes
```bash
git commit -m "Your commit message here"
```

**Good commit messages:**
- "Add Gemini API integration for chatbot"
- "Implement voice button visibility based on chat state"
- "Fix chatbot model selection and error handling"
- "Add ChatContext for managing chat state"

### Step 4: Push to GitHub
```bash
git push origin Mateo_chatbot
```

## Current Branch
You're on: `Mateo_chatbot`

## Files That Will Be Committed
- ✅ App.tsx (voice button visibility)
- ✅ src/context/ChatContext.tsx (new file)
- ✅ src/screens/chat/ChatScreen.tsx (microphone button, chat clearing)
- ✅ src/services/ai/chat.ts (Gemini API integration)
- ✅ README.md, docs/SETUP.md (documentation updates)
- ✅ TROUBLESHOOTING_EXPO.md (new file)

## Important Notes
- ✅ `.env` file is already in `.gitignore` (won't be committed)
- ✅ `secrets.ts` is empty (safe to commit)
- ✅ Your API keys are safe (in `.env` which is ignored)

## If You Get Errors

### "Permission denied" or "Authentication failed"
```bash
# You may need to authenticate
# GitHub now requires a Personal Access Token instead of password
```

### "Branch is ahead/behind"
```bash
# Pull latest changes first
git pull origin Mateo_chatbot

# Then push
git push origin Mateo_chatbot
```

### "Merge conflicts"
```bash
# Resolve conflicts, then:
git add .
git commit -m "Resolve merge conflicts"
git push origin Mateo_chatbot
```
