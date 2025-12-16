# Mobile Map UX Documentation

## Overview

The Map screen provides a production-ready exploration experience with fluid interactions, category filtering, and a professional bottom sheet implementation.

---

## Bottom Sheet Implementation

### Snap Points

The bottom sheet has **3 snap points**:

1. **Collapsed (25%)**: `SCREEN_HEIGHT * 0.75` - Sheet mostly hidden
2. **Mid (60%)**: `SCREEN_HEIGHT * 0.4` - Default position when marker is tapped
3. **Expanded (90%)**: `0` - Sheet fully expanded, shows all content

### Behavior

- **Draggable**: Users can drag the sheet up/down naturally
- **Velocity-based snapping**: Fast swipes move to next/previous snap point
- **Position-based snapping**: Slow drags snap to nearest point
- **Spring animations**: Smooth, elastic feel with `tension: 50, friction: 7`
- **Auto-open**: Opens to mid position when marker is tapped
- **Auto-close**: Closes completely when dragged to bottom

### Implementation Details

- Uses `Animated.Value` with `PanResponder` for gesture handling
- Clamps drag position between min (expanded) and max (collapsed)
- Tracks current snap index to prevent unnecessary animations
- Handles both prop changes and user gestures

---

## Marker → Sheet Interaction

### Flow

1. **User taps marker** → `handleMarkerPress` called
2. **Map centers** → `mapRef.current.animateToRegion()` with 500ms animation
3. **Place selected** → `setSelectedPlace(place)`
4. **Sheet opens** → `setBottomSheetIndex(1)` → Opens to mid position
5. **User can swipe up** → Sheet expands to 90% for full details

### Map Centering

```typescript
mapRef.current.animateToRegion({
  latitude: place.latitude,
  longitude: place.longitude,
  latitudeDelta: 0.01,  // Close zoom
  longitudeDelta: 0.01,
}, 500);  // Smooth 500ms animation
```

### Benefits

- **Intentional feel**: Map centers before sheet opens
- **Smooth animation**: 500ms transition feels natural
- **Close zoom**: 0.01 delta shows marker clearly
- **No jarring jumps**: Everything animates smoothly

---

## Category Filtering

### UI

- **Location**: Floating at top of map, below safe area
- **Style**: Horizontal scrollable chips with shadow
- **Selection**: Primary color background when selected
- **"All" option**: First chip, resets filter

### Behavior

- **Filtering**: Updates visible markers only
- **No reload**: Map doesn't reset, markers update smoothly
- **State management**: `selectedCategory` tracks active filter
- **Auto-close**: Bottom sheet closes when category changes

### Implementation

```typescript
const filteredPlaces = selectedCategory
  ? allPlaces.filter((place: Place) => {
      if (place.category && typeof place.category === 'object' && place.category.id) {
        return place.category.id === selectedCategory;
      }
      return false;
    })
  : allPlaces;
```

### Categories Displayed

- Shows top 10 categories from flattened category tree
- Includes "All" option as first chip
- Horizontal scroll for overflow
- Visual feedback on selection

---

## State Management

### State Variables

1. **selectedCategory**: `number | null`
   - Tracks active category filter
   - `null` = show all places

2. **selectedPlace**: `Place | null`
   - Current place in bottom sheet
   - `null` = sheet closed

3. **bottomSheetIndex**: `number` (0, 1, or 2)
   - Current snap point position
   - 0 = collapsed, 1 = mid, 2 = expanded

### State Flow

```
Marker Tap
  → setSelectedPlace(place)
  → setBottomSheetIndex(1)
  → Sheet opens to mid

Category Change
  → setSelectedCategory(categoryId)
  → setSelectedPlace(null)
  → setBottomSheetIndex(1)
  → Sheet closes, filter updates
```

### Cleanup

- No stale state: State resets on category change
- No flickering: Smooth transitions between states
- No crashes: Handles rapid taps gracefully

---

## UX Principles

### Fluid Interactions

- All animations use spring physics
- No hardcoded timings (except map centering)
- Velocity-based gestures feel natural
- Elastic feel throughout

### Professional Feel

- Bottom sheet behaves like native iOS/Android
- Snap points provide clear affordances
- Visual feedback on all interactions
- No half-baked interactions

### Exploration Tool

- Category filtering reduces noise
- Map centering focuses attention
- Bottom sheet provides context
- Smooth transitions maintain flow

---

## Testing Checklist

### Bottom Sheet

- [x] Sheet opens to mid position on marker tap
- [x] Sheet can be dragged up to expand
- [x] Sheet can be dragged down to collapse
- [x] Sheet snaps to nearest point on release
- [x] Fast swipes move to next/previous point
- [x] Sheet closes when dragged to bottom

### Marker Interaction

- [x] Marker tap centers map smoothly
- [x] Map centers before sheet opens
- [x] Correct place data shown in sheet
- [x] No crashes on rapid taps

### Category Filtering

- [x] "All" category shows all places
- [x] Selected category filters markers
- [x] Markers update without map reload
- [x] Bottom sheet closes on category change
- [x] Visual feedback on selection

### State Management

- [x] No stale state after category change
- [x] No flickering markers
- [x] No crashes on rapid interactions
- [x] Clean state reset

---

## Technical Details

### Dependencies

- `react-native-maps`: Map rendering
- `react-native`: Core components
- `@tanstack/react-query`: Data fetching
- `zustand`: State management (location store)

### Performance

- Category filtering is client-side (fast)
- Map markers update without reload
- Bottom sheet uses native driver animations
- No unnecessary re-renders

### Accessibility

- Touch targets are appropriately sized
- Visual feedback on all interactions
- Clear affordances (handle, chips)
- Smooth animations don't cause motion sickness

---

## Future Enhancements

### Potential Improvements

1. **Marker clustering**: Group nearby markers at low zoom
2. **Search on map**: Search bar to find places
3. **Directions**: Route to selected place
4. **Custom markers**: Category-based marker icons
5. **Heatmap**: Show activity density

### Considerations

- Keep interactions fluid
- Maintain performance
- Preserve UX principles
- Test on real devices

---

**Last Updated**: 2025-12-15  
**Status**: ✅ Production-ready

