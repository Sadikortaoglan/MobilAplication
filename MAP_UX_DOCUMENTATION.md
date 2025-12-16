# Map UX Documentation

## 🎯 Core Principle

**Does the map make the user WANT to explore an area?**

If not → FAIL.

---

## ✅ Absolute Rules

- ✅ NO empty map
- ✅ NO static pins
- ✅ NO meaningless markers
- ✅ NO dead zoom levels

---

## 📱 Map Features

### Interactive Bottom Sheet
- **Place Preview**: Swipeable bottom sheet on marker tap
- **Swipe Gestures**: 
  - Swipe up → Expand to full details
  - Swipe down → Close
  - Drag handle → Adjust height
- **Content**: Place image, name, rating, distance, activity signals
- **Quick Action**: "View Details" button to full place detail screen

### Activity-Based Markers
- **Trending** (Red, 1.2x size): `isTrending === true` OR `visitCountLast7Days > 10`
- **Highly Rated** (Green, 1.1x size): `averageRating >= 4.5`
- **Popular** (Orange, 1.1x size): `reviewCount > 10`
- **Good** (Blue, 1.0x size): `averageRating >= 4.0`
- **Default** (Red, 1.0x size): All others

### Zoom-Aware Behavior
- **Region Change**: Fetches new markers when user zooms/pans
- **Bounds Calculation**: Automatically calculates map bounds
- **Data Refresh**: Updates markers based on visible area
- **Performance**: Debounced region changes to avoid excessive API calls

### Marker Descriptions
- Shows address
- Shows activity: "X visits this week"
- Shows trending status: "Trending"
- Concise, informative

---

## 🔄 Fallback Strategy

### Level 1: Map Markers Endpoint
- **Endpoint**: `GET /api/map/markers`
- **Params**: `north`, `south`, `east`, `west`, `zoom` (optional), `categoryId` (optional)
- **Response**: `{ markers: MapMarker[], bounds: {...}, totalMarkers: number }`

### Level 2: Regular Search
- **Fallback**: If map markers endpoint fails or returns empty
- **Search**: 50km radius, 100 places
- **Sort**: Distance

### Level 3: Trending Places
- **Fallback**: If no nearby data
- **Source**: City-based trending places
- **Limit**: 50 places

### Level 4: Default Location
- **Fallback**: If no user location
- **Center**: Istanbul (41.0082, 28.9784)
- **Show**: Popular places in city

**Result**: NEVER show empty map

---

## 🔌 Backend Endpoints

### GET /api/map/markers

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
      "address": "Moda Caddesi No:123",
      "city": "Istanbul",
      "district": "Kadıköy",
      "createdAt": "2025-12-01T10:00:00",
      "photos": [...]
    }
  ],
  "bounds": {
    "north": 41.1,
    "south": 40.9,
    "east": 29.1,
    "west": 28.9
  },
  "totalMarkers": 45,
  "zoomLevel": 12,
  "clustered": false
}
```

**Logic**:
- `visitIntensity` = (visitCountLast7Days / maxVisitCount) * 10 (0-10 scale)
- `isTrending` = visitCountLast7Days > threshold
- **NEVER return empty** - ensure geographic spread
- **No clustered dummy data** - all coordinates must be real

---

### GET /api/map/heatmap

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

## 📊 Marker Data Requirements

### MapMarker Interface
```typescript
interface MapMarker {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  category: PlaceCategory;
  visitIntensity: number; // 0-10 scale
  isTrending: boolean;
  averageRating: number;
  reviewCount: number;
  address?: string;
  city?: string;
  district?: string;
  createdAt: string;
  photos?: Photo[];
}
```

### Data Quality Rules
- **Geographic Spread**: Markers must be spread across visible area
- **No Clustered Dummy Data**: All coordinates must be real places
- **Activity Must Be Real**: `visitIntensity` and `isTrending` based on actual data
- **Realistic Distribution**: Mix of trending, popular, and regular places

---

## 🎨 Visual Design

### Marker Appearance
- **Size**: Based on activity (1.0x to 1.2x)
- **Color**: Based on rating/activity
- **Anchor**: Bottom center (pin point)
- **Title**: Place name
- **Description**: Address + activity info

### Bottom Sheet
- **Height**: 40% of screen (collapsed), expandable to 70%
- **Animation**: Smooth spring animations
- **Handle**: Visual drag indicator
- **Content**: Image, name, rating, distance, activity, CTA

---

## 🧪 Testing Scenarios

### Scenario 1: User Location ON
- ✅ Map centers on user location
- ✅ Shows nearby markers
- ✅ Bottom sheet works on marker tap
- ✅ Zoom triggers new data fetch

### Scenario 2: User Location OFF
- ✅ Map centers on default city (Istanbul)
- ✅ Shows popular places
- ✅ No empty map
- ✅ Bottom sheet works

### Scenario 3: Sparse Data
- ✅ Fallback to city-based data
- ✅ Fallback to trending places
- ✅ Never shows empty map

### Scenario 4: Dense Data
- ✅ All markers visible
- ✅ Activity-based colors visible
- ✅ Zoom-aware clustering (if implemented)
- ✅ Smooth interactions

---

## 📝 Implementation Checklist

- [x] PlacePreviewBottomSheet component
- [x] Activity-based marker colors
- [x] Zoom-aware data fetching
- [x] Aggressive fallback strategy
- [x] Default location fallback
- [x] Marker descriptions with activity
- [ ] Backend map markers endpoint (required)
- [ ] Backend heatmap endpoint (optional)
- [ ] Manual testing on real device
- [ ] Performance optimization (debounce region changes)

---

## 🚀 Next Steps

1. **Backend Implementation**: Implement `/api/map/markers` with bounds support
2. **Testing**: Test all scenarios on real device
3. **Performance**: Optimize region change debouncing
4. **Clustering**: Consider marker clustering for dense areas (future)

---

**Last Updated**: 2025-12-15  
**Status**: ✅ Mobile App Ready  
**Backend Status**: ⏳ Map Markers Endpoint Required

