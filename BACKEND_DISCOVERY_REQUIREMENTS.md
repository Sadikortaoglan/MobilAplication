# Backend Discovery & Context Requirements

## 🎯 Core Product Principle

**If the API returns empty, static, or contextless data, the product feels dead. THIS MUST NEVER HAPPEN.**

---

## 📋 PART 1 — DISCOVERY & CONTEXT (CRITICAL)

### Endpoints to Implement

#### 1. GET /api/discover/trending

**Purpose**: Show places that are currently trending (recent activity)

**Query Parameters**:
- `latitude` (BigDecimal, optional): User's latitude
- `longitude` (BigDecimal, optional): User's longitude
- `limit` (Integer, optional, default: 20): Number of results

**Response** (200 OK):
```json
{
  "places": [
    {
      "id": 1,
      "name": "Kadıköy Balık Restoranı",
      "category": {
        "id": 6,
        "name": "Turkish",
        "slug": "turkish"
      },
      "averageRating": 4.67,
      "reviewCount": 12,
      "visitCountLast7Days": 45,
      "distanceFromUser": 0.45,
      "photos": [...],
      "isTrending": true,
      "trendingScore": 8.5
    }
  ],
  "context": "trending",
  "generatedAt": "2025-12-15T10:30:00"
}
```

**Logic**:
- Calculate `trendingScore` = (visitCountLast7Days * 0.6) + (reviewCountLast7Days * 0.4)
- Sort by `trendingScore` DESC
- **NEVER return empty** - fallback to popular places if no trending data

---

#### 2. GET /api/discover/popular-this-week

**Purpose**: Show places that are popular this week (weighted score, not just rating)

**Query Parameters**:
- `latitude` (BigDecimal, optional): User's latitude
- `longitude` (BigDecimal, optional): User's longitude
- `limit` (Integer, optional, default: 20): Number of results

**Response** (200 OK):
```json
{
  "places": [
    {
      "id": 1,
      "name": "Kadıköy Balık Restoranı",
      "category": {
        "id": 6,
        "name": "Turkish",
        "slug": "turkish"
      },
      "averageRating": 4.67,
      "reviewCount": 12,
      "visitCountLast7Days": 45,
      "distanceFromUser": 0.45,
      "popularityScore": 7.8,
      "photos": [...]
    }
  ],
  "context": "popular-this-week",
  "generatedAt": "2025-12-15T10:30:00"
}
```

**Logic**:
- Calculate `popularityScore` = (averageRating * 0.4) + (reviewCount * 0.3) + (visitCountLast7Days * 0.3)
- Sort by `popularityScore` DESC
- **NEVER return empty** - fallback to all-time popular if no week data

---

#### 3. GET /api/discover/hidden-gems

**Purpose**: Show high-quality places with low visit count (undiscovered gems)

**Query Parameters**:
- `latitude` (BigDecimal, optional): User's latitude
- `longitude` (BigDecimal, optional): User's longitude
- `limit` (Integer, optional, default: 20): Number of results

**Response** (200 OK):
```json
{
  "places": [
    {
      "id": 1,
      "name": "Kadıköy Balık Restoranı",
      "category": {
        "id": 6,
        "name": "Turkish",
        "slug": "turkish"
      },
      "averageRating": 4.8,
      "reviewCount": 5,
      "visitCount": 12,
      "distanceFromUser": 0.45,
      "hiddenGemScore": 9.2,
      "photos": [...]
    }
  ],
  "context": "hidden-gems",
  "generatedAt": "2025-12-15T10:30:00"
}
```

**Logic**:
- Filter: `averageRating >= 4.0` AND `visitCount < 50`
- Calculate `hiddenGemScore` = (averageRating * 0.7) - (visitCount * 0.1)
- Sort by `hiddenGemScore` DESC
- **NEVER return empty** - fallback to high-rating places if no gems found

---

### Fallback Strategy

**If any discovery endpoint returns empty**:

1. **Primary Fallback**: City-level data (Istanbul default)
2. **Secondary Fallback**: Global popular places
3. **Tertiary Fallback**: Random high-quality places

**Response must ALWAYS include**:
- At least 10 places
- Context explanation: `"fallbackReason": "No trending data, showing popular places"`

---

## 📋 PART 2 — REVIEW SYSTEM AS HUMAN SIGNAL

### Current Endpoints (Verify & Enhance)

#### GET /api/places/{placeId}/reviews/me

**Enhancement**: Add `helpfulCount` to response

**Response** (200 OK):
```json
{
  "id": 1,
  "rating": 5,
  "comment": "Harika bir yer!",
  "helpfulCount": 3,
  "user": {
    "id": 1,
    "displayName": "John Doe"
  },
  "createdAt": "2025-12-13T15:30:00",
  "updatedAt": "2025-12-13T15:30:00"
}
```

---

#### GET /api/places/{placeId}/reviews

**Enhancement**: Add `helpfulCount` and `hasUserReviewed` to each review

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Harika bir yer!",
      "helpfulCount": 3,
      "user": {
        "id": 1,
        "displayName": "John Doe"
      },
      "createdAt": "2025-12-13T15:30:00"
    }
  ],
  "hasUserReviewed": false,
  "userReview": null,
  "page": 0,
  "size": 20,
  "totalElements": 3
}
```

---

#### POST /api/places/{placeId}/reviews/{reviewId}/helpful

**New Endpoint**: Mark review as helpful

**Auth**: ✅ Required (JWT Token)

**Response** (200 OK):
```json
{
  "reviewId": 1,
  "helpfulCount": 4,
  "isHelpful": true
}
```

---

#### GET /api/users/me/stats

**New Endpoint**: Get user statistics

**Auth**: ✅ Required (JWT Token)

**Response** (200 OK):
```json
{
  "visitedCount": 12,
  "reviewCount": 8,
  "favoriteCount": 5,
  "helpfulReviewsGiven": 3
}
```

---

## 📋 PART 3 — VISITED AS A TIMELINE

### New Endpoint

#### GET /api/users/me/visited-timeline

**Purpose**: Get user's visited places as a timeline (chronological)

**Auth**: ✅ Required (JWT Token)

**Query Parameters**:
- `page` (Integer, optional, default: 0)
- `size` (Integer, optional, default: 20)
- `sort` (String, optional, default: "visitedAt"): `visitedAt` (DESC) or `visitedAt` (ASC)

**Response** (200 OK):
```json
{
  "content": [
    {
      "placeId": 1,
      "placeName": "Kadıköy Balık Restoranı",
      "category": {
        "id": 6,
        "name": "Turkish",
        "slug": "turkish"
      },
      "visitedAt": "2025-12-14T18:30:00",
      "photos": [...]
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 12,
  "totalPages": 1
}
```

**Database Requirements**:
- `visited` table must have `created_at` and `updated_at` (DEFAULT now())
- `visited_at` field (timestamp) - when user marked as visited
- Ensure idempotent: One record per user per place
- No duplicate records

---

## 📋 PART 4 — MAP BEHAVIOR & INTELLIGENCE

### New Endpoints

#### GET /api/map/markers

**Purpose**: Get map markers with intensity and context

**Query Parameters**:
- `north` (BigDecimal, required): North bound
- `south` (BigDecimal, required): South bound
- `east` (BigDecimal, required): East bound
- `west` (BigDecimal, required): West bound
- `zoom` (Integer, optional): Map zoom level (for clustering)
- `categoryId` (Long, optional): Filter by category

**Response** (200 OK):
```json
{
  "markers": [
    {
      "id": 1,
      "latitude": 41.0082,
      "longitude": 28.9784,
      "name": "Kadıköy Balık Restoranı",
      "category": {
        "id": 6,
        "name": "Turkish",
        "slug": "turkish"
      },
      "visitIntensity": 8.5,
      "isTrending": true,
      "averageRating": 4.67,
      "reviewCount": 12,
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
  "bounds": {
    "north": 41.1,
    "south": 40.9,
    "east": 29.1,
    "west": 28.9
  },
  "totalMarkers": 45
}
```

**Logic**:
- `visitIntensity` = (visitCountLast7Days / maxVisitCount) * 10
- `isTrending` = visitCountLast7Days > threshold
- **NEVER return empty** - ensure geographic spread

---

#### GET /api/map/heatmap

**Purpose**: Get heatmap data for map visualization

**Query Parameters**:
- `north` (BigDecimal, required)
- `south` (BigDecimal, required)
- `east` (BigDecimal, required)
- `west` (BigDecimal, required)
- `gridSize` (Integer, optional, default: 10): Grid granularity

**Response** (200 OK):
```json
{
  "heatmap": [
    {
      "latitude": 41.0082,
      "longitude": 28.9784,
      "intensity": 8.5,
      "placeCount": 12
    }
  ],
  "maxIntensity": 10.0,
  "bounds": {...}
}
```

---

## 📋 PART 5 — EMPTY STATE ELIMINATION

### Fallback Strategy for All Endpoints

**Rule**: If primary query returns empty, apply fallback in this order:

1. **City-level fallback**: Use Istanbul (or user's city if available)
2. **Category fallback**: Remove category filter, show all
3. **Distance fallback**: Expand radius (10km → 25km → 50km)
4. **Global fallback**: Show popular places globally

**Response Format**:
```json
{
  "content": [...],
  "fallbackApplied": true,
  "fallbackReason": "No places found in 10km radius, showing popular places in Istanbul",
  "originalQuery": {
    "radius": 10,
    "categoryId": 1
  }
}
```

---

## 📋 PART 6 — REALISTIC DATA STRATEGY

### Seed Data Requirements

**Rating Distribution**:
- 15% Excellent (4.5-5.0)
- 55% Very Good (4.0-4.4)
- 20% Good (3.0-3.9)
- 10% Poor (2.0-2.9)

**Review Quality**:
- 30% Short reviews (1-2 sentences)
- 50% Medium reviews (3-5 sentences)
- 20% Long reviews (6+ sentences)
- Some reviews with typos/imperfections (realistic)

**Place Data**:
- 100+ places per major city (Istanbul, Ankara, Izmir)
- 10-15% places with missing descriptions
- 5-10% places with missing photos
- Uneven popularity (some very popular, some hidden gems)

**Geographic Distribution**:
- Realistic coordinates (not clustered)
- Spread across 18+ districts in Istanbul
- No dummy/fake coordinates

---

## 🔧 Implementation Checklist

### Discovery Endpoints
- [ ] Implement `/api/discover/trending`
- [ ] Implement `/api/discover/popular-this-week`
- [ ] Implement `/api/discover/hidden-gems`
- [ ] Add fallback logic to all discovery endpoints
- [ ] Test with empty data scenarios

### Review System
- [ ] Add `helpfulCount` to review responses
- [ ] Add `hasUserReviewed` to place review list
- [ ] Implement `POST /api/places/{placeId}/reviews/{reviewId}/helpful`
- [ ] Implement `GET /api/users/me/stats`
- [ ] Ensure one review per user per place (idempotent)

### Visited Timeline
- [ ] Implement `GET /api/users/me/visited-timeline`
- [ ] Ensure `visited` table has `created_at`, `updated_at`, `visited_at`
- [ ] Fix idempotent visited logic
- [ ] Test timeline ordering

### Map Endpoints
- [ ] Implement `GET /api/map/markers`
- [ ] Implement `GET /api/map/heatmap`
- [ ] Calculate `visitIntensity` and `isTrending`
- [ ] Ensure geographic spread

### Empty State Elimination
- [ ] Implement fallback strategy for all search endpoints
- [ ] Add `fallbackApplied` and `fallbackReason` to responses
- [ ] Test all endpoints with empty data

### Realistic Data
- [ ] Update seed data with realistic ratings (2.8-4.9)
- [ ] Add imperfect reviews (short, typos)
- [ ] Add places with missing data
- [ ] Ensure 100+ places per city
- [ ] Verify geographic distribution

---

## 📝 API Response Standards

### All Discovery Endpoints Must Include:

```json
{
  "places": [...],
  "context": "trending|popular-this-week|hidden-gems",
  "fallbackApplied": false,
  "fallbackReason": null,
  "generatedAt": "2025-12-15T10:30:00",
  "metadata": {
    "totalPlaces": 20,
    "userLocation": {
      "latitude": 41.0082,
      "longitude": 28.9784
    }
  }
}
```

### All Map Endpoints Must Include:

```json
{
  "markers": [...],
  "bounds": {...},
  "totalMarkers": 45,
  "zoomLevel": 12,
  "clustered": false
}
```

---

## 🧪 Testing Requirements

### Mandatory Tests

1. **Discovery Endpoints**:
   - Test with no trending data → fallback works
   - Test with user location → distance calculated
   - Test without user location → city-level data

2. **Review System**:
   - Test duplicate review prevention
   - Test review edit/delete
   - Test helpful count increment

3. **Visited Timeline**:
   - Test chronological ordering
   - Test idempotent visited logic
   - Test pagination

4. **Map Endpoints**:
   - Test with different zoom levels
   - Test bounds filtering
   - Test geographic spread

5. **Fallback Logic**:
   - Test all endpoints with empty data
   - Verify fallback messages
   - Verify fallback data quality

---

## 📚 Documentation Updates

After implementation, update:
- Backend API documentation
- Mobile app API service methods
- Web desktop API service methods

---

**Last Updated**: 2025-12-15  
**Status**: ⏳ Backend Implementation Required  
**Priority**: 🔴 CRITICAL

