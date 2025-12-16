# Cache Temizleme Talimatları

## shadowMd Runtime Hatası Çözümü

Eğer `ReferenceError: Property 'shadowMd' doesn't exist` hatası alıyorsanız:

### 1. Metro Bundler Cache'i Temizle

```bash
cd /Users/sadikortaoglan/Desktop/MegaFindSpot/MobileApp
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .metro*
```

### 2. Expo Process'lerini Durdur

```bash
pkill -f expo
pkill -f metro
```

### 3. Uygulamayı Yeniden Başlat

```bash
npm start
```

Sonra terminal'de:
- **iOS**: `i` tuşuna basın
- **Android**: `a` tuşuna basın
- **Web**: `w` tuşuna basın

### 4. Eğer Hala Sorun Varsa

```bash
# Watchman cache'i temizle (eğer yüklüyse)
watchman watch-del-all

# Node modules'ü yeniden yükle
rm -rf node_modules
npm install

# Expo'yu yeniden başlat
npm start
```

---

## shadowMd Tanımı

`shadowMd` `src/theme/designSystem.ts` dosyasında tanımlı:

```typescript
export const shadowMd = createShadow(
  {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  {
    elevation: 3,
  },
  {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  }
);
```

`createShadow` fonksiyonu her zaman geçerli bir obje döndürür (undefined olamaz).

---

## Doğrulama

Cache temizlendikten sonra uygulama başladığında:
- ✅ `shadowMd` hatası olmamalı
- ✅ Tüm ekranlar düzgün render edilmeli
- ✅ Shadow stilleri görünür olmalı

---

**Son Güncelleme**: 2025-12-15

