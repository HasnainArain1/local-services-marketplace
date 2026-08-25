# LocalServ — Customer Mobile App

Customer-facing React Native (Expo) mobile app for the **Local Services Marketplace**. Customers can browse service categories, submit free-text service requests (AI-matched to providers), chat with providers, track request status, and leave reviews.

## Tech Stack

- **React Native** (Expo SDK)
- **React Navigation** — bottom tabs + stack navigation
- **Axios** — HTTP client with centralized JWT handling
- **AsyncStorage** — secure local JWT persistence

## Project Structure

```
mobile-app/
├── App.js                          # Root component
├── app.json                        # Expo config (includes apiBaseUrl)
├── .env.example                    # Environment variable template
├── src/
│   ├── config.js                   # Reads API_BASE_URL from Expo constants
│   ├── api.js                      # Centralized API client (all endpoints)
│   ├── theme.js                    # Colours, fonts, spacing, status mappings
│   ├── context/
│   │   └── AuthContext.js          # Auth state, login/signup/logout, auto-login
│   ├── navigation/
│   │   └── Navigation.js          # Tab + stack navigators, auth guard
│   ├── components/
│   │   ├── CategoryCard.js        # Home grid card
│   │   ├── StatusBadge.js         # Colour-coded status pill
│   │   ├── StatusStepper.js       # Visual progress stepper
│   │   ├── StarRating.js          # Star input + display
│   │   ├── ChatBubble.js          # Message bubble
│   │   └── EmptyState.js          # List placeholder
│   └── screens/
│       ├── LoginScreen.js
│       ├── SignupScreen.js
│       ├── HomeScreen.js
│       ├── SubmitRequestScreen.js
│       ├── RequestDetailScreen.js
│       ├── MyRequestsScreen.js
│       ├── ChatScreen.js
│       ├── ReviewScreen.js
│       ├── ProfileScreen.js
│       └── SupportChatScreen.js
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- Android Studio (for emulator) or Expo Go app on your phone

### Run Locally

```bash
cd mobile-app
npm install
npx expo start
```

Then:
- Press **a** to open in Android emulator
- Press **w** to open in web browser
- Scan the QR code with **Expo Go** on your phone

### Configure Backend URL

The API base URL is set in `app.json` → `extra.apiBaseUrl`.

- **Android emulator**: `http://10.0.2.2:8000/api/v1` (default — maps to host machine's localhost)
- **Physical device**: Use your machine's LAN IP, e.g. `http://192.168.1.100:8000/api/v1`
- **Deployed backend**: `https://your-backend.onrender.com/api/v1`

### Build APK (for testing/sharing)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build Android APK
eas build --platform android --profile preview
```

For a quick local APK without EAS:
```bash
npx expo export --platform android
```

## Screens

| Screen | Description |
|--------|-------------|
| **Login / Signup** | Email/password auth, role is always `customer` |
| **Home** | Category grid, active request card, submit CTA |
| **Submit Request** | Free-text problem, optional category, location, contact |
| **Request Detail** | Status stepper, quote accept/decline, chat/review buttons |
| **My Requests** | History list with status badges |
| **Chat** | Real-time messaging with 4s polling + optimistic send |
| **Review** | Star rating + comment after completion |
| **Profile** | View/edit user info, logout |
| **Support Chat** | AI chatbot for FAQs |

## Backend Endpoints

All under `/api/v1` — see `src/api.js` for the complete mapping.
