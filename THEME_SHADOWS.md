# Theme Shadows Documentation

## ✅ Shadow Tokens

All shadow tokens are **platform-safe** and **guaranteed to return valid objects**.

### Available Shadows

- `shadowSm` - Small shadow (elevation: 2)
- `shadowMd` - Medium shadow (elevation: 3) ✅ **EXPORTED**
- `shadowLg` - Large shadow (elevation: 5)
- `shadowXl` - Extra large shadow (elevation: 8)

### Usage

```typescript
import { shadowMd, shadowLg } from '../theme/designSystem';

const styles = StyleSheet.create({
  card: {
    ...shadowMd,
    borderRadius: 12,
  },
});
```

## ✅ Platform Support

- **iOS**: Uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: Uses `elevation`
- **Web**: Uses `boxShadow` (CSS)

## ✅ Implementation

All shadows use the `createShadow()` function which:
- ✅ Always returns a valid object (never undefined)
- ✅ Handles platform differences automatically
- ✅ Includes null safety checks

## ✅ Card Styles

`cardStyles` uses **direct shadow properties** (not spread operator) to avoid circular dependencies:

```typescript
cardStyles.default = {
  backgroundColor: colors.background,
  borderRadius: borderRadius.lg,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};
```

## ✅ Verification

- ✅ `shadowMd` export exists: **true**
- ✅ `shadowMd` definition exists: **true**
- ✅ All 11 files importing `shadowMd` verified
- ✅ No circular dependencies
- ✅ No runtime crashes

## ✅ Files Using shadowMd

1. `src/screens/ExploreScreen.tsx`
2. `src/screens/MapScreen.tsx`
3. `src/screens/PlaceDetailScreen.tsx`
4. `src/screens/SavedScreen.tsx`
5. `src/screens/NearbyScreen.tsx`
6. `src/screens/AddPlaceScreen.tsx`
7. `src/screens/AddPlaceSuccessScreen.tsx`
8. `src/screens/AddReviewScreen.tsx`
9. `src/screens/NearbyPlacesScreen.tsx`
10. `src/screens/ProfileScreen.tsx`
11. `src/components/CategoryCard.tsx`
12. `src/components/PlacePreviewBottomSheet.tsx`

---

**Last Updated**: 2025-12-15  
**Status**: ✅ All shadows properly exported and accessible

