# MOJ VIS Mobile App

React Native (Expo) mobile application for MOJ VIS.

## Status: Phase 0 (Skeleton)

This is a minimal setup with:
- Expo SDK with TypeScript
- React Navigation structure
- Global header component (MOJ VIS rules)
- Onboarding flow skeleton (3 screens)
- Home screen skeleton
- HR/EN locale files (structure only)

**No business logic, no API calls yet.**

## Requirements

- Node.js >= 18.0.0
- Expo CLI (`npm install -g expo-cli` or use npx)
- iOS Simulator (macOS) or Android Emulator

## Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

3. **Run on simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |

## Project Structure

```
mobile/
├── App.tsx                 # Root component
├── app.json                # Expo configuration
├── locales/
│   ├── hr.json             # Croatian translations
│   └── en.json             # English translations
├── src/
│   ├── components/
│   │   └── GlobalHeader.tsx    # Global header (MOJ VIS rules)
│   ├── navigation/
│   │   ├── types.ts            # Navigation type definitions
│   │   └── AppNavigator.tsx    # Root navigator
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── LanguageSelectionScreen.tsx
│   │   │   ├── UserModeSelectionScreen.tsx
│   │   │   └── MunicipalitySelectionScreen.tsx
│   │   └── home/
│   │       └── HomeScreen.tsx
│   ├── hooks/              # Custom hooks (empty)
│   └── types/              # Type definitions (empty)
├── assets/                 # Images, fonts
└── README.md
```

## MOJ VIS Header Rules (Implemented)

Per specification, the global header follows these rules:

**Root screens** (Home, Events, Transport):
- Left: Hamburger menu
- Center: "MOJ VIS"
- Right: Inbox icon

**Child screens** (Details, Forms):
- Left: Back button
- Center: "MOJ VIS"
- Right: Inbox icon

**Inbox screens**:
- Inbox icon is NOT shown

## Onboarding Flow

1. **Language Selection** → Select HR or EN
2. **User Mode Selection** → Visitor or Local
3. **Municipality Selection** (Local only) → Vis or Komiža
4. **Home** → Main app

## What's Missing (Intentionally)

Phase 0 does NOT include:
- API integration
- State management
- Actual navigation to all screens
- Drawer menu implementation
- Push notifications
- Offline storage
- Image assets (using placeholders)

These will be added in subsequent phases.
