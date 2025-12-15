# API Dokümantasyon Güncelleme Kontrolü

## 📋 Mevcut Durum

### Mobile App API Endpoints

**Place Submission**:
- `POST /api/places` - `addPlace()` method'unda kullanılıyor
- **Dosya**: `src/services/api.ts` (line 187)

**Diğer Endpoint'ler**:
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `GET /api/auth/me`
- ✅ `GET /api/categories`
- ✅ `GET /api/places/search`
- ✅ `GET /api/places/{id}`
- ✅ `POST /api/places/{id}/favorite`
- ✅ `DELETE /api/places/{id}/favorite`
- ✅ `GET /api/user/favorites`
- ✅ `POST /api/places/{id}/visited`
- ✅ `DELETE /api/places/{id}/visited`
- ✅ `GET /api/user/visited`
- ✅ `GET /api/places/{id}/reviews`
- ✅ `POST /api/places/{id}/reviews`
- ✅ `GET /api/places/{id}/reviews/me`
- ✅ `PUT /api/places/{id}/reviews/{reviewId}`
- ✅ `DELETE /api/places/{id}/reviews/{reviewId}`

---

### Web Desktop API Endpoints

**Place Submission**:
- `POST /api/places/submit` - `submitPlace()` method'unda kullanılıyor
- **Dosya**: `src/services/place.ts` (line 92)

**Diğer Endpoint'ler**:
- ✅ `GET /api/categories`
- ✅ `GET /api/places/search`
- ✅ `GET /api/places/{id}`
- ✅ `GET /api/places/{id}/reviews`
- ✅ `POST /api/places/{id}/reviews`
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`

---

## ⚠️ Tespit Edilen Tutarsızlıklar

### 1. Place Submission Endpoint

**Mobile App**: `POST /api/places`
**Web Desktop**: `POST /api/places/submit`

**Sorun**: İki farklı endpoint kullanılıyor.

**Çözüm**: Güncellenmiş API dokümantasyonuna göre doğru endpoint'i belirleyip her iki projede de güncelleme yapılmalı.

---

## 🔍 Kontrol Edilmesi Gerekenler

### Güncellenmiş API Dokümantasyonunda:

1. **Place Submission Endpoint**:
   - [ ] `POST /api/places` mı?
   - [ ] `POST /api/places/submit` mı?
   - [ ] `POST /api/user/places` mı?

2. **Yeni Endpoint'ler**:
   - [ ] Yeni endpoint'ler eklendi mi?
   - [ ] Endpoint path'leri değişti mi?
   - [ ] Request/Response formatları değişti mi?

3. **Eksik Endpoint'ler**:
   - [ ] `/api/places/{id}/reviews/me` dokümantasyonda var mı?
   - [ ] Review update/delete endpoint'leri dokümantasyonda var mı?

4. **Request/Response Değişiklikleri**:
   - [ ] Place submission request body değişti mi?
   - [ ] Response formatları değişti mi?
   - [ ] Yeni field'lar eklendi mi?

---

## 📝 Yapılacaklar

1. **Güncellenmiş API dokümantasyonunu incele**
2. **Mobile app endpoint'lerini güncelle**
3. **Web desktop endpoint'lerini güncelle**
4. **TypeScript type'larını güncelle**
5. **API_COMPLIANCE_CHECK.md'yi güncelle**
6. **Test et ve commit et**

---

**Son Güncelleme**: 2025-12-15  
**Durum**: ⏳ Güncellenmiş dokümantasyon bekleniyor

