# Backend Fixes Required

This document outlines the critical backend fixes needed for the FindSpot mobile app.

## 1. VISITED TABLE - Database Constraint Fix

### Problem
```
null value in column "created_at" of relation "visited"
```

### Root Cause
- `visited.created_at` column is NOT NULL
- Insert queries do NOT provide `created_at`
- No default value exists

### Required Fix

**Option 1: Add DEFAULT constraint (Recommended)**
```sql
ALTER TABLE visited 
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE visited 
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
```

**Option 2: Entity Lifecycle (JPA/Hibernate)**
```java
@Entity
@Table(name = "visited")
public class Visited {
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Option 3: Manual in Service Layer**
```java
Visited visited = new Visited();
visited.setCreatedAt(LocalDateTime.now());
visited.setUpdatedAt(LocalDateTime.now());
visitedRepository.save(visited);
```

### Ensure
- `created_at` is ALWAYS populated
- `updated_at` is ALWAYS populated
- NEVER allow NULL inserts

---

## 2. REVIEW DUPLICATION LOGIC - Fix Review Check

### Problem
- Backend responds "You have already reviewed" even when user has NOT reviewed
- False positives blocking legitimate reviews

### Required Fix

**Strict Review Existence Check:**
```java
@Query("SELECT r FROM Review r WHERE r.user.id = :userId AND r.place.id = :placeId")
Optional<Review> findByUserIdAndPlaceId(@Param("userId") Long userId, @Param("placeId") Long placeId);

// In service:
public ReviewResponse addReview(Long placeId, Long userId, ReviewRequest request) {
    // Check if review exists - STRICT check
    Optional<Review> existingReview = reviewRepository.findByUserIdAndPlaceId(userId, placeId);
    
    if (existingReview.isPresent()) {
        throw new ConflictException("You have already reviewed this place");
    }
    
    // Create new review
    Review review = new Review();
    review.setUser(userRepository.findById(userId).orElseThrow());
    review.setPlace(placeRepository.findById(placeId).orElseThrow());
    review.setRating(request.getRating());
    review.setComment(request.getComment());
    
    return reviewRepository.save(review);
}
```

### Error Response Codes
- `409 Conflict` - ONLY if review exists
- `201 Created` - If review created successfully
- `400 Bad Request` - For validation errors
- `404 Not Found` - If place/user not found

### Ensure
- No caching of review existence
- No stale flags
- Check is ALWAYS against database
- New users CAN review
- Only truly existing reviews block submission

---

## 3. API ENDPOINTS - Required Endpoints

### Favorites
```
POST   /api/places/{placeId}/favorite
DELETE /api/places/{placeId}/favorite
GET    /api/user/favorites
```

### Visited
```
POST   /api/places/{placeId}/visited
DELETE /api/places/{placeId}/visited
GET    /api/user/visited
```

### User Review Check
```
GET    /api/places/{placeId}/reviews/me
Returns: Review object or 404 if not found
```

### Response Format
All list endpoints should return:
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 10,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

OR simple array:
```json
[...]
```

---

## 4. ERROR RESPONSE CONSISTENCY

### Standard Error Format
```json
{
  "timestamp": "2025-12-15T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "User-friendly error message",
  "path": "/api/endpoint"
}
```

### Never Return
- Raw SQL errors
- Stack traces
- Technical database messages
- Internal error details

### Always Return
- User-friendly messages
- Clear error codes
- Consistent structure

---

## 5. TESTING CHECKLIST

### Visited Action
- [ ] New user marks place as visited → Works
- [ ] User unmarks visited → Works
- [ ] No SQL errors in response
- [ ] created_at/updated_at always populated

### Review Logic
- [ ] New user can review → Works
- [ ] User tries to review twice → 409 Conflict
- [ ] Review check is accurate (no false positives)
- [ ] GET /api/places/{id}/reviews/me returns correct result

### Favorites
- [ ] Toggle favorite works
- [ ] GET /api/user/favorites returns correct list
- [ ] Favorite persists after app restart

---

## Implementation Priority

1. **CRITICAL**: Fix visited.created_at constraint
2. **CRITICAL**: Fix review duplication logic
3. **HIGH**: Implement missing endpoints
4. **MEDIUM**: Standardize error responses

