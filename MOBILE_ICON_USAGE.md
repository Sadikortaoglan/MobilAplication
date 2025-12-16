# Mobile Icon Usage Rules

## ✅ Icon Family: Feather Icons

This app uses **@expo/vector-icons** with **Feather** icon family.

### Valid Feather Icons

Common valid Feather icon names:
- `star` - Star icon
- `heart` - Heart icon
- `map` - Map icon
- `search` - Search icon
- `user` - User icon
- `settings` - Settings icon
- `home` - Home icon
- `award` - Award icon
- `zap` - Lightning icon
- `trending-up` - Trending up icon

### ❌ Invalid Icons

**DO NOT USE:**
- `gem` - NOT in Feather icon set
- Any icon name not in Feather's official list

### How to Verify Icon Names

1. Check Feather Icons documentation: https://feathericons.com/
2. Use only icons from the official Feather icon set
3. Test icons in development - invalid icons show warnings

---

## ✅ Icon Usage Pattern

```typescript
import { Feather } from '@expo/vector-icons';

<Feather name="star" size={20} color={colors.success} />
```

### Rules

1. **Always use valid Feather icon names**
2. **Never use invalid icon names** (e.g., "gem")
3. **Test icons in development** - check console for warnings
4. **Replace invalid icons immediately** - don't ignore warnings

---

## ✅ Icon Replacement Guide

If you need to replace an invalid icon:

1. **Find the icon usage**:
   ```bash
   grep -r "name=\"gem\"" src/
   ```

2. **Choose a valid alternative**:
   - `gem` → `star` (for hidden gems, favorites)
   - `gem` → `award` (for achievements)
   - `gem` → `zap` (for highlights)

3. **Replace and test**:
   ```typescript
   // Before (INVALID)
   <Feather name="gem" size={20} color={colors.success} />
   
   // After (VALID)
   <Feather name="star" size={20} color={colors.success} />
   ```

4. **Verify no console warnings**

---

## ✅ Fixed Issues

### Issue #1: Invalid "gem" Icon
- **File**: `src/screens/ExploreScreen.tsx`
- **Line**: 360
- **Fix**: Replaced `name="gem"` with `name="star"`
- **Status**: ✅ Fixed

---

## ✅ Testing Checklist

Before committing icon changes:

- [ ] No console warnings about invalid icons
- [ ] Icons render correctly in UI
- [ ] Icons are semantically appropriate
- [ ] All icon names are valid Feather icons

---

**Last Updated**: 2025-12-15  
**Status**: ✅ All icons validated, no invalid icon names

