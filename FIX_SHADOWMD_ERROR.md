# shadowMd Runtime Hatası Çözümü

## 🔴 Hata
```
ReferenceError: Property 'shadowMd' doesn't exist
```

## ✅ Çözüm Adımları

### 1. Tüm Process'leri Durdur
```bash
pkill -f expo
pkill -f metro
```

### 2. Cache'i Temizle
```bash
cd /Users/sadikortaoglan/Desktop/MegaFindSpot/MobileApp
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .metro*
```

### 3. Watchman Cache'i Temizle (Eğer yüklüyse)
```bash
watchman watch-del-all
```

### 4. Uygulamayı Yeniden Başlat
```bash
npm start
```

Sonra terminal'de:
- **iOS**: `i` tuşuna basın
- **Android**: `a` tuşuna basın  
- **Web**: `w` tuşuna basın

### 5. Eğer Hala Sorun Varsa

**Node Modules'ü Yeniden Yükle:**
```bash
rm -rf node_modules
npm install
npm start
```

---

## ✅ Doğrulama

`shadowMd` `src/theme/designSystem.ts` dosyasında **doğru şekilde tanımlı**:

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

`createShadow` fonksiyonu **her zaman geçerli bir obje döndürür** (undefined olamaz).

---

## 🔍 Sorun Nerede?

1. ✅ `shadowMd` tanımlı ve export edilmiş
2. ✅ Tüm import'lar doğru
3. ✅ `createShadow` fonksiyonu güvenli
4. ⚠️ **Sorun**: Metro bundler cache'i eski versiyonu kullanıyor olabilir

---

## 📝 Not

Cache temizlendikten sonra uygulama başladığında:
- ✅ `shadowMd` hatası olmamalı
- ✅ Tüm ekranlar düzgün render edilmeli
- ✅ Shadow stilleri görünür olmalı

Eğer hala sorun varsa, lütfen hangi ekranda/component'te hata aldığınızı belirtin.

---

**Son Güncelleme**: 2025-12-15

