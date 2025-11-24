# Hızlı Başlangıç Rehberi

Bu rehber, MVP'yi en hızlı şekilde çalıştırmak için gereken adımları içerir.

## Ön Gereksinimler

✅ Node.js 18+ yüklü olmalı
✅ npm veya yarn yüklü olmalı
✅ Firebase hesabı (ücretsiz)

## Adım 1: Firebase Projesi Oluştur (5 dakika)

1. https://console.firebase.google.com/ adresine git
2. "Add Project" butonuna tıkla
3. Proje adı gir (örn: yemek-fiyat-takip)
4. Google Analytics'i devre dışı bırak (isteğe bağlı)
5. "Create Project" tıkla

### Firestore Database Etkinleştir

1. Sol menüden "Firestore Database" seç
2. "Create Database" tıkla
3. **"Start in test mode"** seç (üretim için rules değiştir)
4. Bölge seç: "europe-west" (Avrupa için)
5. "Enable" tıkla

### Web App Ekle

1. Project Overview > "Add App" > Web (</>) ikonu
2. App nickname gir (örn: yemek-takip-web)
3. Firebase Hosting'i şimdilik atla
4. "Register App" tıkla
5. **firebaseConfig** bilgilerini kopyala (sonra kullanacağız)

### Service Account Anahtarı İndir

1. Project Settings (⚙️) > Service Accounts
2. "Generate New Private Key" tıkla
3. JSON dosyasını indir
4. Dosyayı `sunucu/firebase-service-account.json` olarak kaydet

## Adım 2: Backend Kurulum (2 dakika)

```bash
cd c:/projects/yemek-fiyat-takip/sunucu
npm install
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth cheerio user-agents firebase-admin
```

## Adım 3: Frontend Kurulum (2 dakika)

```bash
cd c:/projects/yemek-fiyat-takip/istemci
npm install
```

### Environment Variables Ayarla

`istemci/.env.local` dosyası oluştur ve Firebase config bilgilerini ekle:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yemek-fiyat-takip.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yemek-fiyat-takip
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yemek-fiyat-takip.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Adım 4: İlk Test (5-10 dakika)

### Backend Scraper Testi

```bash
cd c:/projects/yemek-fiyat-takip/sunucu
npx ts-node src/test-indirim-scraper.ts
```

**Ne olacak?**
- Yemeksepeti, Getir, Trendyol ve Migros'tan indirimler çekilecek
- Sonuçlar `indirim-test-sonuclari.json` dosyasına kaydedilecek
- Firebase'e otomatik yüklenecek

**Beklenen Çıktı:**
```
🎯 İNDİRİM ODAKLI MVP TEST BAŞLATILIYOR...

🍕 1. YEMEKSEPETİ TEST
────────────────────────────────────────────────────────────────────────────────
✅ TAMAMLANDI
   • Kampanyalar: 15
   • İndirim Kodları: 8
   • İndirimli Restoranlar: 23

🛵 2. GETIR TEST
...

✅ TEST TAMAMLANDI!
```

### Frontend Başlat

```bash
cd c:/projects/yemek-fiyat-takip/istemci
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç.

## Adım 5: Uygulamayı Kullan

### Ana Sayfa (İndirim Feed'i)

1. Bölge seçiciyi kullanarak bölgeni seç (örn: Kadıköy, İstanbul)
2. Feed'de indirimleri gör
3. Sahte indirim uyarılarına dikkat et
4. "Sipariş Ver" butonuyla platforma git

### İndirim Kodları Sayfası

1. Üst menüden "İndirim Kodları" seç
2. Platformlara göre filtrele
3. Kod kopyala butonunu kullan

## Sorun Giderme

### Scraper Çalışmıyor

**Sorun:** `Error: Failed to launch the browser process`

**Çözüm:** Chromium indirme sorunu olabilir:
```bash
npm install puppeteer --ignore-scripts=false
```

### Firebase Bağlantı Hatası

**Sorun:** `Firebase: Error (auth/invalid-api-key)`

**Çözüm:** `.env.local` dosyasındaki API anahtarını kontrol et

### Port Already in Use

**Sorun:** `Error: listen EADDRINUSE: address already in use :::3000`

**Çözüm:** Farklı port kullan:
```bash
npm run dev -- -p 3001
```

### Scraping Rate Limit

**Sorun:** `Rate limit exceeded`

**Çözüm:** `sunucu/src/servisler/scraping/rate-limiter.servis.ts` dosyasında bekleme sürelerini artır

## Performans İpuçları

### 1. Headless Mode Devre Dışı (Debug için)

`sunucu/src/servisler/scraping/browser.servis.ts` içinde:

```typescript
headless: false, // Tarayıcıyı görmek için
```

### 2. Sadece Bir Platform Test Et

`test-indirim-scraper.ts` içinde diğer platformları yorum satırına al:

```typescript
// const getirScraper = new GetirIndirimScraper(...);
// const trendyolScraper = new TrendyolIndirimScraper(...);
// const migrosScraper = new MigrosIndirimScraper(...);
```

### 3. Demo Data ile Test

Firebase olmadan test etmek için frontend'de demo data otomatik gösterilir.

## Sonraki Adımlar

✅ MVP çalışıyor
⬜ Proxy listesi ekle (IP banlama için)
⬜ Cron job kur (günde 2-3 kez scraping)
⬜ Firebase hosting'e deploy et
⬜ Sahte indirim algoritması ekle

## Deployment (Opsiyonel)

### Firebase Hosting

```bash
cd istemci
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: .next
# Single-page app: Yes
# Automatic builds: No
firebase deploy
```

Uygulamanız şu adreste yayında: `https://yemek-fiyat-takip.web.app`

## Yardım

Sorun mu yaşıyorsunuz?

1. `README.md` dosyasını okuyun
2. `SCRAPING-REHBER.md` dosyasına bakın
3. `FIREBASE-KURULUM.md` dosyasını inceleyin
4. GitHub'da issue açın

## Başarılı Kurulum Kontrol Listesi

- [x] Node.js ve npm yüklü
- [x] Firebase projesi oluşturuldu
- [x] Firestore etkinleştirildi
- [x] Service account anahtarı indirildi
- [x] Backend dependencies yüklendi
- [x] Frontend dependencies yüklendi
- [x] .env.local dosyası oluşturuldu
- [x] Test scraper çalıştı
- [x] Frontend başlatıldı
- [x] http://localhost:3000 açıldı

Hepsini tamamladıysanız, MVP'niz hazır! 🎉
