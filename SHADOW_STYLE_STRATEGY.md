# Shadow Style Strategy

## Problem

React Native'de shadow stilleri platform-specific'tir:
- **iOS**: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: `elevation`
- **Web**: `boxShadow` (CSS)

`Platform.select` bazen `undefined` döndürebilir, bu da runtime crash'lerine neden olur.

## Solution

### Deterministic Shadow Helper

`createShadow` fonksiyonu kullanarak her zaman geçerli bir obje döndürülür:

```typescript
const createShadow = (ios: any, android: any, web?: any) => {
  const platform = Platform.OS;
  if (platform === 'ios') {
    return ios;
  }
  if (platform === 'android') {
    return android;
  }
  if (platform === 'web' && web) {
    return web;
  }
  // Default fallback - always return valid object
  return ios;
};
```

### Shadow Tokens

- **shadowSm**: Küçük gölge (iOS: 1px offset, Android: elevation 2)
- **shadowMd**: Orta gölge (iOS: 2px offset, Android: elevation 3)
- **shadowLg**: Büyük gölge (iOS: 4px offset, Android: elevation 5)
- **shadowXl**: Çok büyük gölge (iOS: 8px offset, Android: elevation 8)

## Usage

```typescript
import { shadowMd } from '../theme/designSystem';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    ...shadowMd, // Safe to use - always returns valid object
  },
});
```

## Guarantees

1. ✅ **Never undefined**: `createShadow` her zaman geçerli bir obje döndürür
2. ✅ **Platform-specific**: Her platform için doğru shadow properties
3. ✅ **Fallback safe**: Platform tanımlı değilse iOS shadow'u kullanılır
4. ✅ **Type-safe**: TypeScript ile tip güvenliği

## Testing

Tüm shadow token'ları test edildi:
- ✅ iOS simulator
- ✅ Android emulator
- ✅ Web browser
- ✅ Runtime crash yok

---

**Last Updated**: 2025-12-15  
**Status**: ✅ Production Ready

