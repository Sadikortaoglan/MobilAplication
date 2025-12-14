# 🚀 Uygulamayı Başlatma Kılavuzu

## Terminal'de Şu Komutu Çalıştırın:

```bash
cd /Users/sadikortaoglan/Desktop/MegaFindSpot/MobileApp
npm start
```

## Sonra Terminal'de Şunları Göreceksiniz:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

## Web Tarayıcıda Açmak İçin:

Terminal'de **`w`** tuşuna basın

Veya tarayıcıda şu adrese gidin:
**http://localhost:8081**

## Fiziksel Cihazda Test (Önerilen):

1. Telefonunuza **"Expo Go"** uygulamasını indirin
2. Terminal'deki **QR kodu** tarayın
3. Uygulama telefonunuzda açılacak

## Sorun Giderme:

- Eğer port hatası alırsanız: `pkill -f expo` çalıştırıp tekrar deneyin
- Eğer modül bulunamadı hatası alırsanız: `npm install` çalıştırın
- Backend bağlantısı için: Backend'iniz `http://localhost:8080` adresinde çalışıyor olmalı

