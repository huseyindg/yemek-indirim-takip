# 🍕 Yemek Fiyat Takip - MVP

Online yemek platformlarındaki fiyatları karşılaştıran, sahte indirimleri tespit eden **web scraping tabanlı** MVP projesi.

## ⚡ Hızlı Başlangıç

```bash
cd c:/projects/yemek-fiyat-takip/sunucu
npm install
npx ts-node src/test-scraper.ts
```

**Detaylı adımlar için:** [MVP-BASLANGIC.md](./MVP-BASLANGIC.md)

---

## 🎯 MVP Özellikleri

### ✅ Hazır Olan
```
✅ 4 Platform Scraper (Yemeksepeti, Getir, Trendyol, Migros)
✅ IP Rotation Sistemi
✅ Rate Limiting (3-8 saniye arası bekleme)
✅ Anti-Ban Özellikleri (Stealth mode, User-Agent rotation)
✅ Firebase Entegrasyonu (Opsiyonel)
✅ Test Scripti
```

### 🔄 Geliştiriliyor
```
🔄 Frontend (Next.js)
🔄 Firebase Hosting Deployment
🔄 Fiyat geçmişi grafikleri
🔄 Sahte indirim algılama algoritması
```

---

## 📊 Desteklenen Platformlar

| Platform | Durum | Özellikler |
|----------|-------|-----------|
| **Yemeksepeti** | ✅ Hazır | Restoran arama, Menü çekme, Kampanyalar |
| **Getir Yemek** | ✅ Hazır | Restoran arama, Menü çekme |
| **Trendyol Yemek** | ✅ Hazır | Restoran arama, Menü çekme |
| **Migros** | ✅ Hazır | Ürün çekme |
| **Tıkla Gelsin** | ⏳ Gelecek | - |

---

## 🏗️ Proje Yapısı

```
yemek-fiyat-takip/
├── sunucu/                     # Backend (NestJS + Scraping)
│   ├── src/
│   │   ├── servisler/
│   │   │   └── scraping/
│   │   │       ├── browser.servis.ts        # Puppeteer yönetimi
│   │   │       ├── proxy.servis.ts          # IP rotation
│   │   │       ├── rate-limiter.servis.ts   # Yavaş istek
│   │   │       └── platformlar/
│   │   │           ├── yemeksepeti.scraper.ts
│   │   │           ├── getir.scraper.ts
│   │   │           ├── trendyol.scraper.ts
│   │   │           └── migros.scraper.ts
│   │   ├── modeller/            # Database modelleri
│   │   ├── ayarlar/
│   │   │   └── firebase.ayar.ts # Firebase config
│   │   └── test-scraper.ts      # 🧪 MVP TEST SCRİPTİ
│   └── package.json
├── istemci/                    # Frontend (Next.js) - Gelecek
├── SCRAPING-REHBER.md          # 📖 Web scraping detaylı rehber
├── FIREBASE-KURULUM.md         # 🔥 Firebase kurulum adımları
├── MVP-BASLANGIC.md            # 🚀 MVP test rehberi
└── README.md
```

---

## 💻 Teknoloji Stack

### Backend
- **Framework:** NestJS + TypeScript
- **Scraping:** Puppeteer + Puppeteer-Extra (Stealth)
- **HTML Parsing:** Cheerio
- **Database:** Firebase Firestore (Opsiyonel) veya PostgreSQL
- **Anti-Ban:** Proxy rotation, Rate limiting, User-Agent spoofing

### Scraping Özellikleri
```
🕷️ Puppeteer (Headless browser)
🎭 Stealth mode (Bot detection bypass)
🔄 IP Rotation
⏱️ Rate Limiting (Platform başına özel)
🤖 İnsan benzeri davranış
📊 Real-time logging
```

---

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd sunucu
npm install
```

### 2. Scraping Kütüphanelerini Ekle

`package.json`'a ekleyin:
```json
"puppeteer": "^21.6.1",
"cheerio": "^1.0.0-rc.12",
"user-agents": "^1.1.185",
"firebase-admin": "^12.0.0"
```

Tekrar:
```bash
npm install
```

### 3. Firebase Kurulumu (Opsiyonel)

Detaylar için: [FIREBASE-KURULUM.md](./FIREBASE-KURULUM.md)

```bash
# 1. Firebase Console'da proje oluştur
# 2. firebase-admin-key.json indir
# 3. sunucu/ klasörüne koy
```

### 4. MVP'yi Test Et

```bash
npx ts-node src/test-scraper.ts
```

**⏱️ Süre:** ~15-20 dakika (4 platform, yavaş istek)

---

## 📈 Test Sonuçları Örneği

```
🚀 MVP Test Başlatılıyor...

📍 1. YEMEKSEPETI TEST
────────────────────────────────────────────────
🔄 Restoran aranıyor...
⏱️  yemeksepeti için 4 saniye bekleniyor...
✅ 15 restoran bulundu
✅ 42 ürün çekildi

📍 2. GETIR TEST
────────────────────────────────────────────────
✅ 12 restoran bulundu
✅ 38 ürün çekildi

📊 TEST ÖZET
════════════════════════════════════════════════
✅ Toplam Restoran: 45
✅ Toplam Ürün: 156
```

---

## ⚠️ Yasal Uyarılar

```
❌ Web scraping ToS (Terms of Service) ihlali olabilir
❌ IP ban riski var
❌ Ticari kullanımda yasal sorun çıkarabilir
❌ Production'da kullanılmamalı

✅ Sadece eğitim/öğrenme amaçlı
✅ MVP/test için uygundur
✅ Kişisel proje olarak kullanılabilir
```

**Tavsiye:** Production'da resmi API'lara geçin!

---

## 🔧 Yapılandırma

### Proxy Ayarları

`.env` dosyası:
```env
# Proxy listesi (virgülle ayrılmış)
PROXY_LISTESI=proxy1.com:8080,proxy2.com:3128

NODE_ENV=development
```

### Rate Limiting Ayarları

`rate-limiter.servis.ts`:
```typescript
yemeksepeti: {
  minBekleme: 3000,    // 3 saniye
  maxBekleme: 7000,    // 7 saniye
  dakikadaMaksIstem: 15
}
```

---

## 📚 Dokümantasyon

- 🚀 **[MVP-BASLANGIC.md](./MVP-BASLANGIC.md)** - Hızlı başlangıç rehberi
- 🕷️ **[SCRAPING-REHBER.md](./SCRAPING-REHBER.md)** - Web scraping detayları
- 🔥 **[FIREBASE-KURULUM.md](./FIREBASE-KURULUM.md)** - Firebase kurulum adımları

---

## 🐛 Sorun Giderme

### "Puppeteer bulunamadı"
```bash
npm install puppeteer --save
```

### "Timeout hatası"
```typescript
// browser.servis.ts - timeout süresini artırın
timeout: 60000 // 30000 → 60000
```

### "IP ban"
- Proxy kullanın
- Rate limit'i yavaşlatın
- 24 saat bekleyin

### Debug Mode
```typescript
// browser.servis.ts
headless: false // Browser görünür olur
```

---

## 🎯 Roadmap

### Faz 1: MVP ✅ **TAMAMLANDI**
- [x] 4 platform scraper
- [x] IP rotation
- [x] Rate limiting
- [x] Test scripti

### Faz 2: Frontend 🔄 **Geliştiriliyor**
- [ ] Next.js kurulumu
- [ ] Fiyat karşılaştırma UI
- [ ] Grafik gösterimler
- [ ] Firebase Hosting deployment

### Faz 3: Gelişmiş Özellikler ⏳ **Planlanan**
- [ ] Fiyat geçmişi algoritması
- [ ] Sahte indirim tespiti
- [ ] Kullanıcı bildirimleri
- [ ] Affiliate link sistemi
- [ ] Cron job (otomatik veri çekme)

### Faz 4: Production 🔮 **Gelecek**
- [ ] Resmi API'lara geçiş
- [ ] PostgreSQL entegrasyonu
- [ ] Redis cache
- [ ] Digital Ocean deployment

---

## 💡 İpuçları

### Performans
```
✅ Geceleyin çalıştır (02:00-06:00)
✅ Az sayıda ürün çek (ilk 10-20)
✅ Cache kullan
❌ Paralel scraping yapma (IP ban riski)
```

### Güvenlik
```
✅ .env dosyasını git'e ekleme
✅ firebase-admin-key.json'u git'e ekleme
✅ Proxy kullan
✅ User-Agent rotation
```

---

## 🤝 Katkıda Bulunma

Bu bir MVP projesidir. Katkılar için:

1. Fork edin
2. Feature branch oluşturun
3. Commit yapın
4. Push edin
5. Pull Request açın

---

## 📄 Lisans

MIT License - Sadece eğitim amaçlı kullanın!

---

## 👨‍💻 Geliştirici

AI destekli geliştirilmiştir.

---

## 🎉 Başarıyla Çalıştırdınız mı?

Test sonuçlarınızı görmek isteriz!

**Kolay gelsin!** 🚀
