# 🚀 MVP Başlangıç Rehberi

## ✅ Hazırlananlar

```
✅ 4 Platform Scraper (Yemeksepeti, Getir, Trendyol, Migros)
✅ IP Rotation Sistemi
✅ Rate Limiting (Yavaş İstek)
✅ Anti-Ban Özellikleri
✅ Firebase Entegrasyonu (Opsiyonel)
✅ Test Scripti
```

---

## 📦 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
cd c:/projects/yemek-fiyat-takip/sunucu
npm install
```

### 2. Scraping Kütüphanelerini Ekleyin

`package.json` dosyasını açın ve `dependencies` kısmına şunları ekleyin:

```json
{
  "dependencies": {
    "puppeteer": "^21.6.1",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2",
    "cheerio": "^1.0.0-rc.12",
    "user-agents": "^1.1.185",
    "proxy-chain": "^2.4.0",
    "p-queue": "^8.0.1",
    "retry": "^0.13.1",
    "firebase-admin": "^12.0.0"
  }
}
```

Sonra tekrar:

```bash
npm install
```

### 3. TypeScript Ayarları

`tsconfig.json`'u kontrol edin - zaten mevcut olmalı.

### 4. .env Dosyası (Opsiyonel - Proxy için)

`sunucu/.env` dosyası oluşturun:

```env
# Proxy listesi (opsiyonel - yoksa IP rotation çalışmaz)
PROXY_LISTESI=

# Node environment
NODE_ENV=development
```

### 5. Firebase Kurulumu (Opsiyonel)

Firebase kullanmak isterseniz:

1. https://console.firebase.google.com/ → Yeni proje
2. Service account key indir → `firebase-admin-key.json` olarak kaydet
3. Dosyayı `sunucu/` klasörüne koyun
4. `.gitignore`'a ekleyin

**Önemli:** Firebase olmadan da test edebilirsiniz!

---

## 🧪 MVP'yi Test Edin

### Basit Test (1 Platform)

```bash
cd c:/projects/yemek-fiyat-takip/sunucu

# TypeScript ile çalıştır
npx ts-node src/test-scraper.ts
```

### Ne Olacak?

```
🚀 MVP Test Başlatılıyor...

🔍 Arama kelimesi: "pizza"

📍 1. YEMEKSEPETI TEST
────────────────────────────────────────────────
🔄 Restoran aranıyor...
⏱️  yemeksepeti için 3 saniye bekleniyor...
🌐 Sayfa açılıyor: https://www.yemeksepeti.com
✅ 15 restoran bulundu
🔄 İlk restoranın menüsü çekiliyor: Pizza Locale
⏱️  yemeksepeti için 5 saniye bekleniyor...
✅ 42 ürün çekildi

📍 2. GETIR TEST
────────────────────────────────────────────────
...

📊 TEST ÖZET
════════════════════════════════════════════════

✅ Toplam Restoran: 45
✅ Toplam Ürün: 156

Platform Detayları:
  • Yemeksepeti: 15 restoran, 42 ürün
  • Getir: 12 restoran, 38 ürün
  • Trendyol: 18 restoran, 51 ürün
  • Migros: 10 ürün

✅ Test tamamlandı!
```

---

## ⏱️ Bekleme Süreleri

Test yaklaşık **15-20 dakika** sürebilir çünkü:

```
✅ Her platform için 3-8 saniye arası bekleme
✅ Dakikada maksimum 10-20 istek
✅ İnsan gibi davranış simülasyonu
✅ Sayfa yükleme süreleri

= TOPLAM: ~20 dakika (4 platform)
```

**⚠️ Sabırlı olun!** Bu yavaşlık bilerek yapıldı (IP ban önleme).

---

## 🔍 Debug Modu

Sorun olursa browser'ı görünür yapın:

`src/servisler/scraping/browser.servis.ts` dosyasında:

```typescript
headless: false, // true yerine false yapın
```

Böylece tarayıcıyı görebilir ve nerede takıldığını anlayabilirsiniz.

---

## ⚠️ Yaygın Sorunlar

### 1. "Puppeteer bulunamadı"

```bash
npm install puppeteer --save
```

### 2. "Timeout hatası"

Yavaş internet bağlantısı olabilir:

```typescript
// browser.servis.ts içinde timeout'u artırın
timeout: 60000, // 30000'den 60000'e
```

### 3. "Selector bulunamadı"

Site HTML yapısı değişmiş olabilir:

- Debug mode açın (headless: false)
- Sayfaya göz atın
- Selector'ları güncelleyin

### 4. "IP ban yedim"

- Proxy kullanın
- Daha yavaş istek atın (rate limit artırın)
- 24 saat bekleyin
- Farklı ağ kullanın (mobil hotspot)

---

## 📊 Sonuçları Görme

### Console Output

Tüm sonuçlar console'da yazdırılır.

### Firebase'de Görme (Opsiyonel)

Firebase kullanıyorsanız:

1. https://console.firebase.google.com/
2. Projenizi seçin
3. **Firestore Database**
4. **urunler** collection'ına bakın

### JSON Dosyasına Kaydet

`test-scraper.ts` sonuna ekleyin:

```typescript
// Dosyaya kaydet
import * as fs from 'fs';
fs.writeFileSync(
  'sonuclar.json',
  JSON.stringify(sonuclar, null, 2),
  'utf-8'
);
console.log('💾 sonuclar.json dosyasına kaydedildi');
```

---

## 🎯 Sonraki Adımlar

### 1. Frontend Hazırla
```bash
cd c:/projects/yemek-fiyat-takip/istemci
npm create next-app@latest .
```

### 2. Firebase Hosting'e Deploy
```bash
firebase deploy
```

### 3. Cron Job Ekle (Otomatik Veri Çekme)
```bash
# Her 6 saatte bir çalışsın
0 */6 * * * cd /path/to/project && npm run scrape
```

### 4. Daha Fazla Platform Ekle
- Tıkla Gelsin
- Diğer lokal platformlar

---

## 💡 İpuçları

### Performans

```
✅ Paralel scraping yapma - sıralı yap (IP ban riski)
✅ Geceleyin çalıştır (02:00-06:00)
✅ Az sayıda ürün çek (ilk 10-20)
✅ Cache kullan (aynı veriyi tekrar çekme)
```

### Güvenlik

```
✅ .env dosyasını git'e ekleme
✅ firebase-admin-key.json'u git'e ekleme
✅ Proxy kullan (IP gizleme)
✅ User-Agent rotation
```

---

## 📞 Yardım

Sorun mu yaşıyorsunuz?

1. **Debug mode** açın
2. **Console log**'ları okuyun
3. **Scraping rehber**'e bakın: `SCRAPING-REHBER.md`
4. **Firebase rehber**'e bakın: `FIREBASE-KURULUM.md`

---

## 🎉 Başarılar!

MVP'niz hazır! Test edin ve sonuçları görün 🚀

**Unutmayın:** Bu sadece test amaçlı. Production'da resmi API kullanın!

---

## 📝 Checklist

Başlamadan önce:

- [ ] Node.js kurulu (v18+)
- [ ] npm install yapıldı
- [ ] Scraping kütüphaneleri eklendi
- [ ] .env dosyası oluşturuldu (opsiyonel)
- [ ] Firebase kuruldu (opsiyonel)
- [ ] İnternet bağlantısı iyi
- [ ] Zamanınız var (20+ dakika)

Hazırsanız:

```bash
npx ts-node src/test-scraper.ts
```

🚀 **Kolay gelsin!**
