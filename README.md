# MobilAplication

# FindSpot Mobile App

React Native mobile application for finding nearby places.

## Features

- GPS-based location services
- Category and subcategory filtering
- List and map view of nearby places
- Place details with photos and reviews
- User authentication (JWT)
- Review submission
- User profile

## Tech Stack

- React Native (Expo)
- TypeScript
- React Navigation
- Zustand (State Management)
- Axios (HTTP Client)
- React Query (Data Fetching)
- Expo Location API
- React Native Maps
- Expo SecureStore (JWT Storage)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
Create a `.env` file or set `EXPO_PUBLIC_API_URL` environment variable:
```
EXPO_PUBLIC_API_URL=http://your-api-url.com
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

5. Run on Android:
```bash
npm run android
```

## Project Structure

```
src/
  ├── components/       # Reusable UI components
  ├── screens/          # Screen components
  ├── navigation/       # Navigation configuration
  ├── services/         # API and location services
  ├── store/            # Zustand stores
  └── types/            # TypeScript type definitions
```

## API Endpoints

The app uses the following backend endpoints:

- `GET /api/categories` - Get all categories (tree structure)
- `GET /api/places/search` - Search nearby places (with pagination)
- `GET /api/places/{id}` - Get place details
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/places/{id}/reviews` - Get place reviews (with pagination)
- `POST /api/places/{id}/reviews` - Add review

## Environment Variables

Backend API URL'ini `.env` dosyasında ayarlayabilirsiniz:

1. Proje kök dizininde `.env` dosyası oluşturun:
```bash
EXPO_PUBLIC_API_URL=http://localhost:8080
```

2. Eğer backend farklı bir port'ta çalışıyorsa, `.env` dosyasını güncelleyin:
```bash
EXPO_PUBLIC_API_URL=http://localhost:YOUR_PORT
```

3. Production için:
```bash
EXPO_PUBLIC_API_URL=https://api.findspot.com
```

**Not**: 
- `.env` dosyası `.gitignore`'da olduğu için commit edilmez
- Değişikliklerin etkili olması için uygulamayı yeniden başlatın (`npm start`)
- API URL console'da görüntülenir (development mode'da)

## Google Maps Setup

For Android, add your Google Maps API key to `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY"/>
```

For iOS, add your Google Maps API key to `ios/YourApp/AppDelegate.m` or configure it in `app.json`:
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_API_KEY"
      }
    }
  }
}
```

