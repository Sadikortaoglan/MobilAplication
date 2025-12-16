# Mobile Shadow Style Standard

## ✅ Root Cause Analysis

**Problem**: `ReferenceError: Property 'shadowMd' doesn't exist`

**Root Cause**: `shadowMd` was exported from `designSystem.ts` but became undefined at runtime due to module resolution issues in Metro bundler.

**Solution**: Removed `shadowMd` export and replaced ALL usages with inline shadow properties directly in StyleSheet definitions.

---

## ✅ New Shadow Standard

### DO: Use Inline Shadow Properties

```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    // Inline shadow properties - ALWAYS works
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### DON'T: Import shadowMd

```typescript
// ❌ REMOVED - Do not use
import { shadowMd } from '../theme/designSystem';
const styles = StyleSheet.create({
  card: {
    ...shadowMd, // This caused runtime errors
  },
});
```

---

## ✅ Shadow Values Reference

### Medium Shadow (Most Common)
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,
```

### Small Shadow
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.05,
shadowRadius: 2,
elevation: 2,
```

### Large Shadow
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 8,
elevation: 5,
```

### Extra Large Shadow
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.2,
shadowRadius: 16,
elevation: 8,
```

---

## ✅ Files Updated

All files that previously used `shadowMd` have been updated:

1. `src/screens/ExploreScreen.tsx` - 2 usages replaced
2. `src/screens/MapScreen.tsx` - 2 usages replaced
3. `src/screens/PlaceDetailScreen.tsx` - 1 usage replaced
4. `src/screens/SavedScreen.tsx` - 1 usage replaced
5. `src/screens/NearbyScreen.tsx` - 1 usage replaced
6. `src/screens/AddPlaceScreen.tsx` - 2 usages replaced
7. `src/screens/AddPlaceSuccessScreen.tsx` - 2 usages replaced
8. `src/screens/AddReviewScreen.tsx` - 1 usage replaced
9. `src/screens/NearbyPlacesScreen.tsx` - 1 usage replaced
10. `src/screens/ProfileScreen.tsx` - 3 usages replaced
11. `src/components/CategoryCard.tsx` - 2 usages replaced
12. `src/components/PlacePreviewBottomSheet.tsx` - 1 usage replaced

**Total**: 19 usages replaced with inline shadow properties

---

## ✅ Why This Works

1. **No Module Resolution Issues**: Inline properties don't depend on module exports
2. **Runtime Guaranteed**: StyleSheet.create() processes inline properties immediately
3. **No Circular Dependencies**: Each style is self-contained
4. **Platform Safe**: Both iOS (shadowColor/shadowOffset) and Android (elevation) properties included

---

## ✅ Remaining Shadow Exports

The following shadow exports remain in `designSystem.ts` for backward compatibility:

- `shadowSm` - Small shadow (still exported)
- `shadowLg` - Large shadow (still exported)
- `shadowXl` - Extra large shadow (still exported)

**Note**: `shadowMd` has been **completely removed** from exports.

---

## ✅ Testing

After this fix:

1. ✅ App boots without `ReferenceError`
2. ✅ All screens render correctly
3. ✅ Shadow styles appear as expected
4. ✅ No runtime crashes

---

**Last Updated**: 2025-12-15  
**Status**: ✅ All shadowMd usages removed, app boots cleanly

