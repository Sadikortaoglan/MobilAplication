# Explore Screen UX Documentation

## 🎯 Core Principle

**When the app opens, the user must immediately feel: "Something interesting is happening here."**

If not → FAIL.

---

## ✅ Absolute Rules

- ✅ NO empty sections
- ✅ NO generic lists
- ✅ NO static boring UI
- ✅ NO technical language in UI

---

## 📱 Screen Structure

### Hero Section
- **Purpose**: First impression, clear value proposition
- **Content**: 
  - Large friendly title
  - Clear subtext
  - Primary action button ("Explore nearby places")
  - Add place CTA
  - Soft location prompt (if location unavailable)

### Discovery Sections (Priority Order)

1. **Active Nearby** (if available)
   - Places with recent activity nearby
   - Shows activity signals: "X visits this week"
   - Icon: Activity

2. **Trending Near You**
   - Places trending in last 7 days
   - Shows "Trending" badge
   - Icon: Trending-up

3. **Popular This Week**
   - Weighted popularity score (not just rating)
   - Icon: Star

4. **Hidden Gems**
   - High rating + low visit count
   - Icon: Gem

5. **Popular Places** (Fallback)
   - Always shown if no discovery data
   - Icon: Star

### Category Showcase
- Horizontal scroll
- Large cards with icons
- Always visible (if categories available)

---

## 🎨 Visual Design

### Place Cards
- **Rich visuals**: Cover images
- **Activity badges**:
  - "Trending" badge (if trending)
  - "X visits this week" badge (if active)
- **Rating display**: Stars + numeric rating + review count
- **Distance**: If available

### Section Headers
- Icon + Title
- "See all" link (if > 5 items)
- Clear visual hierarchy

---

## 🔄 Fallback Strategy

### Level 1: Discovery Endpoints
- Try `/api/discover/trending`
- Try `/api/discover/popular-this-week`
- Try `/api/discover/hidden-gems`
- Try `/api/discover/nearby-active`

### Level 2: Regular Search (City-based)
- Search within 50km radius
- Sort by rating
- Show top 20 places

### Level 3: Expanded Search
- Search within 100km radius
- Sort by rating
- Show top 20 places

### Level 4: Ultimate Fallback
- Show categories
- Show map CTA
- Never show "No places found"

---

## 📊 Activity Signals

### Trending Badge
- Shown if: `isTrending === true` OR `visitCountLast7Days > 10`
- Visual: Primary color badge with "Trending" text
- Position: Top-left overlay on image

### Activity Badge
- Shown if: `visitCountLast7Days > 0` AND not trending
- Visual: Dark semi-transparent badge
- Text: "X visits this week" or "X visit this week"
- Position: Top-left overlay on image

---

## 🚫 Empty State Elimination

### Rules:
1. **Never show empty sections** - Hide section if no data
2. **Always show fallback** - If discovery fails, show popular places
3. **Always show categories** - Categories are always available
4. **Always show map CTA** - Ultimate fallback action

### Implementation:
```typescript
// Smart section visibility
const hasAnyDiscoveryData = trendingPlaces.length > 0 || 
                           popularPlaces.length > 0 || 
                           hiddenGems.length > 0 || 
                           nearbyActivePlaces.length > 0;

const shouldShowFallback = !hasAnyDiscoveryData && fallbackPlaces.length > 0;
```

---

## 🔌 Backend Endpoints

### Required Endpoints

#### GET /api/discover/trending
- **Query Params**: `latitude`, `longitude`, `limit`
- **Response**: `{ places: Place[], context: 'trending', ... }`
- **Logic**: Visits + reviews in last 7 days
- **Fallback**: Expand radius → City → Global

#### GET /api/discover/popular-this-week
- **Query Params**: `latitude`, `longitude`, `limit`
- **Response**: `{ places: Place[], context: 'popular-this-week', ... }`
- **Logic**: Weighted score (rating * 0.4 + reviews * 0.3 + visits * 0.3)
- **Fallback**: Expand radius → City → Global

#### GET /api/discover/hidden-gems
- **Query Params**: `latitude`, `longitude`, `limit`
- **Response**: `{ places: Place[], context: 'hidden-gems', ... }`
- **Logic**: High rating (>= 4.0) + Low visit count (< 50)
- **Fallback**: Expand radius → City → Global

#### GET /api/discover/nearby-active
- **Query Params**: `latitude`, `longitude`, `limit`
- **Response**: `{ places: Place[], context: 'nearby-active', ... }`
- **Logic**: Places with recent activity (visits/reviews) nearby
- **Fallback**: Regular search

### Response Format

```typescript
interface DiscoveryResponse {
  places: Place[];
  context: 'trending' | 'popular-this-week' | 'hidden-gems' | 'nearby-active';
  fallbackApplied: boolean;
  fallbackReason?: string;
  generatedAt: string;
  metadata?: {
    totalPlaces: number;
    userLocation?: {
      latitude: number;
      longitude: number;
    };
  };
}
```

### Place Object Extensions

```typescript
interface Place {
  // ... existing fields ...
  
  // Activity signals
  visitCountLast7Days?: number;
  isTrending?: boolean;
  trendingScore?: number;
  popularityScore?: number;
  hiddenGemScore?: number;
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: New User (No Location)
- ✅ Hero section visible
- ✅ Categories visible
- ✅ Discovery sections show city-based data
- ✅ No empty states

### Scenario 2: User with Location
- ✅ Hero section visible
- ✅ Categories visible
- ✅ Discovery sections show nearby data
- ✅ Activity signals visible
- ✅ No empty states

### Scenario 3: User with Empty Favorites
- ✅ Explore screen unaffected
- ✅ Discovery sections still show
- ✅ No dependency on user data

### Scenario 4: Backend Endpoints Not Available
- ✅ Fallback to regular search
- ✅ Popular places section shown
- ✅ Categories still visible
- ✅ Map CTA available

---

## 📝 Implementation Checklist

- [x] Discovery endpoint methods in API service
- [x] Activity signals in Place type
- [x] Activity badges in PlaceCard
- [x] Smart section visibility logic
- [x] Aggressive fallback strategy
- [x] Empty state elimination
- [x] Visual hierarchy improvements
- [ ] Backend endpoint implementation (required)
- [ ] Manual testing on real device
- [ ] Performance optimization

---

## 🚀 Next Steps

1. **Backend Implementation**: Implement discovery endpoints with fallback logic
2. **Testing**: Test all scenarios on real device
3. **Performance**: Optimize image loading and list rendering
4. **Analytics**: Track which sections users interact with most

---

**Last Updated**: 2025-12-15  
**Status**: ✅ Mobile App Ready  
**Backend Status**: ⏳ Implementation Required

