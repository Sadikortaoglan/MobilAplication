# Place Detail Error Fix - Root Cause Analysis

## Problem
Users see "could not load place" error on Place Detail screen.

## Frontend Fixes Applied

### 1. API Service Error Logging
**File**: `src/services/api.ts`

Added detailed error logging in `getPlaceById`:
- Logs placeId, status, statusText, response data, and error message
- Only logs in development mode (`__DEV__`)

### 2. PlaceDetailScreen Error Handling
**File**: `src/screens/PlaceDetailScreen.tsx`

**Changes**:
- Added detailed error logging in query function
- Improved error message display based on status code:
  - **404**: "Place not found" - Place may have been removed
  - **403**: "Place awaiting approval" - Shows backend message if available
  - **500**: "Server error" - Server encountered an error
  - **Other**: Shows backend error message or generic message
- Added debug text in development mode showing status and message
- Retry logic: Don't retry on 404 or 403 (these are permanent errors)

## Backend Requirements (MUST FIX)

### GET /api/places/{id} Endpoint

**Current Issues** (to verify):
1. May return 404 for APPROVED places (should not)
2. May return 500 for missing optional fields (should handle gracefully)
3. May not return proper error messages for 403 (PENDING places)

**Required Behavior**:

#### Success Response (200)
```json
{
  "id": 1,
  "name": "Place Name",
  "description": "Description",
  "category": {
    "id": 1,
    "name": "Category",
    "slug": "category"
  },
  "averageRating": 4.5,
  "reviewCount": 10,
  "latitude": 41.0082,
  "longitude": 28.9784,
  "address": "Address",
  "status": "APPROVED",
  "isFavorited": false,
  "hasReviewed": false,
  "hasVisited": false,
  "userReviewId": null
}
```

#### Error Responses

**404 - Place Not Found**:
```json
{
  "message": "Place not found",
  "status": 404
}
```

**403 - Place Pending**:
```json
{
  "message": "Place is awaiting approval and not yet available",
  "status": 403,
  "reason": "PENDING"
}
```

**500 - Server Error**:
```json
{
  "message": "Internal server error",
  "status": 500
}
```

### Backend Controller Checklist

- [ ] Verify place exists before checking status
- [ ] Return 404 only if place doesn't exist
- [ ] Return 403 with message if status is PENDING
- [ ] Return 200 with full data if status is APPROVED
- [ ] Handle null optional fields gracefully (don't throw 500)
- [ ] Include user-specific fields (isFavorited, hasReviewed, hasVisited) if authenticated
- [ ] Log errors for debugging

### Backend Service Checklist

- [ ] Check place existence first
- [ ] Check status after existence check
- [ ] Handle database errors gracefully
- [ ] Return proper error messages
- [ ] Don't throw exceptions for missing optional fields

### Backend Repository Checklist

- [ ] Verify foreign key constraints
- [ ] Check for orphan rows
- [ ] Ensure ID type consistency
- [ ] Handle null values properly

## Data Integrity Checks

### Required Checks:
1. **places.id type consistency**: Ensure all IDs are same type (INTEGER/BIGINT)
2. **Foreign keys**:
   - `reviews.place_id` → `places.id`
   - `favorites.place_id` → `places.id`
   - `visited.place_id` → `places.id`
3. **No orphan rows**: All foreign keys should reference existing places
4. **No null-required fields**: Required fields should never be null

## Testing Checklist

### Frontend Tests
- [x] Error logging added
- [x] Error messages improved
- [x] Status code handling added
- [ ] Test 404 error (place not found)
- [ ] Test 403 error (pending place)
- [ ] Test 500 error (server error)
- [ ] Test successful load (approved place)
- [ ] Test with favorited place
- [ ] Test with reviewed place
- [ ] Test Map → Detail → Back → Repeat (no crash)

### Backend Tests (TO DO)
- [ ] Test GET /api/places/{id} with valid approved place
- [ ] Test GET /api/places/{id} with pending place (should return 403)
- [ ] Test GET /api/places/{id} with non-existent ID (should return 404)
- [ ] Test GET /api/places/{id} with authenticated user (check isFavorited, hasReviewed)
- [ ] Test GET /api/places/{id} with database error (should return 500 with message)
- [ ] Test GET /api/places/{id} with null optional fields (should not crash)

## Next Steps

1. **Backend**: Fix GET /api/places/{id} endpoint according to requirements
2. **Backend**: Add proper error handling and logging
3. **Backend**: Verify data integrity
4. **Testing**: Test all scenarios
5. **Documentation**: Update API documentation

## Files Changed

### Frontend
- `src/services/api.ts`: Added error logging in `getPlaceById`
- `src/screens/PlaceDetailScreen.tsx`: Improved error handling and messages

### Backend (TO DO)
- PlaceController: Fix GET /api/places/{id} endpoint
- PlaceService: Add proper error handling
- PlaceRepository: Verify data integrity

