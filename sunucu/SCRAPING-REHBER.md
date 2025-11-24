# 🕷️ Web Scraping Sistemi Kullanım Rehberi

## ⚠️ ÖNEMLİ UYARILAR

### Yasal Uyarı
```
❌ Web scraping yasal riskler taşır
❌ Platform ToS (kullanım şartları) ihlali
❌ IP ban riski var
❌ Ticari kullanımda hukuki sorun çıkarabilir

✅ Sadece eğitim/öğrenme amaçlı kullanın
✅ Production'da resmi API'lara geçin
✅ Kişisel/MVP test için uygundur
```

---

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
cd sunucu
npm install
```

**Ekstra scraping bağımlılıkları:**
```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
npm install cheerio user-agents proxy-chain p-queue retry
```

### 2. Çevre Değişkenlerini Ayarlayın

`.env` dosyası oluşturun:

```env
# Proxy Listesi (opsiyonel ama ÖNERİLİR)
PROXY_LISTESI=proxy1.example.com:8080,proxy2.example.com:3128

# Veritabanı
VERITABANI_HOST=localhost
VERITABANI_PORT=5432
VERITABANI_KULLANICI=postgres
VERITABANI_SIFRE=postgres
VERITABANI_ADI=yemek_fiyat_takip

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📡 Proxy Sistemi

### Neden Proxy Gerekli?

- ✅ IP ban'den korunma
- ✅ Farklı lokasyonlardan istek
- ✅ Rate limit bypass
- ✅ Anonim kalma

### Ücretsiz Proxy Kaynakları

**⚠️ Dikkat:** Ücretsiz proxy'ler yavaş ve güvenilmezdir!

1. **Free Proxy List**
   - https://free-proxy-list.net/
   - https://www.proxy-list.download/

2. **Scraper API'ler** (Ücretli ama güvenilir)
   - https://www.scraperapi.com/
   - https://brightdata.com/
   - https://oxylabs.io/

### Proxy Formatı

```env
# HTTP Proxy
PROXY_LISTESI=123.45.67.89:8080,98.76.54.32:3128

# Kimlik doğrulamalı proxy (gelecekte eklenecek)
# PROXY_LISTESI=user:pass@123.45.67.89:8080
```

---

## 🎯 Anti-Ban Özellikleri

### 1. **IP Rotation** ✅
Her istekte farklı proxy kullanılır

### 2. **Rate Limiting** ✅
Platform başına özel bekleme süreleri:

| Platform | Dakikada Max İstek | Bekleme Süresi |
|----------|-------------------|---------------|
| Yemeksepeti | 15 | 3-7 saniye |
| Getir | 12 | 4-8 saniye |
| Trendyol | 20 | 2.5-6 saniye |
| Migros | 15 | 3.5-7.5 saniye |

### 3. **User-Agent Rotation** ✅
Her istekte rastgele browser kimliği

### 4. **Stealth Mode** ✅
- WebDriver algılama engelleme
- Bot tespitini atlatma
- İnsan gibi davranış simülasyonu

### 5. **İnsan Benzeri Davranışlar** ✅
- Rastgele mouse hareketleri
- Sayfa kaydırma
- Rastgele bekleme süreleri
- Gerçekçi tıklama gecikmeleri

---

## 💻 Kullanım Örnekleri

### Yemeksepeti'nden Restoran Arama

```typescript
import { YemeksepetiScraper } from './servisler/scraping/platformlar/yemeksepeti.scraper';

const scraper = new YemeksepetiScraper(
  browserServisi,
  rateLimiterServisi,
  proxyServisi
);

// Restoran ara
const restoranlar = await scraper.restoranAra('pizza');
console.log(`${restoranlar.length} restoran bulundu`);

// Menü çek
const menuUrl = 'https://www.yemeksepeti.com/restaurant/xyz';
const urunler = await scraper.restoranMenusuCek(menuUrl);
console.log(`${urunler.length} ürün çekildi`);

// Kampanyaları çek
const kampanyalar = await scraper.kampanyalariCek();
console.log(`${kampanyalar.length} kampanya bulundu`);
```

---

## 🔧 Sistem Mimarisi

```
┌──────────────────────────────────────────────┐
│         Scraping Servisleri                   │
├──────────────────────────────────────────────┤
│                                               │
│  ┌─────────────┐  ┌──────────────┐          │
│  │   Proxy     │  │ Rate Limiter │          │
│  │  Rotation   │  │   (Yavaş     │          │
│  │             │  │    İstek)    │          │
│  └─────────────┘  └──────────────┘          │
│         │                 │                   │
│         └─────────┬───────┘                  │
│                   ▼                           │
│          ┌─────────────────┐                 │
│          │  Browser Servis │                 │
│          │   (Puppeteer +  │                 │
│          │     Stealth)    │                 │
│          └─────────────────┘                 │
│                   │                           │
│      ┌────────────┼────────────┐             │
│      ▼            ▼            ▼             │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │Yemek   │  │ Getir  │  │Trendyol│        │
│  │Sepeti  │  │Scraper │  │Scraper │        │
│  │Scraper │  └────────┘  └────────┘        │
│  └────────┘                                  │
│                                               │
└──────────────────────────────────────────────┘
```

---

## 📊 Rate Limiting Stratejisi

### Neden Yavaş İstek?

```
❌ Hızlı istek = Bot tespiti
❌ Hızlı istek = IP ban
❌ Hızlı istek = CAPTCHA

✅ Yavaş istek = İnsan gibi görünür
✅ Yavaş istek = Ban riski azalır
✅ Yavaş istek = Sürdürülebilir
```

### Önerilen Strateji

1. **Düşük Hacim** - Günde max 1000-2000 istek
2. **Gece Saatleri** - 02:00-06:00 arası daha az risk
3. **Rastgele Aralıklar** - Tahmin edilemez pattern
4. **Error Handling** - Hata durumunda exponential backoff

---

## 🛡️ Hata Yönetimi

### Yaygın Hatalar ve Çözümleri

#### 1. CAPTCHA Karşılaştı
```
Çözüm:
- Proxy değiştir
- Daha uzun bekle (10-15 dakika)
- 2captcha API kullan (ücretli)
```

#### 2. IP Ban
```
Çözüm:
- Farklı proxy havuzuna geç
- 24 saat bekle
- VPN + Proxy kombinasyonu
```

#### 3. Timeout Hatası
```
Çözüm:
- Timeout süresini artır (30s → 60s)
- Daha hızlı proxy kullan
- Headless false yap (debug için)
```

#### 4. Selector Bulunamadı
```
Çözüm:
- Site HTML yapısı değişmiş olabilir
- Selector'ları güncelle
- Cheerio parse kontrolü yap
```

---

## 📈 Performans İpuçları

### 1. Gereksiz Kaynakları Engelle
```typescript
// Resim, font, stylesheet yüklemeyi engelle
await sayfa.setRequestInterception(true);
sayfa.on('request', (request) => {
  if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
    request.abort();
  } else {
    request.continue();
  }
});
```

### 2. Headless Modu Kullan
```typescript
headless: 'new' // Daha hızlı
```

### 3. Paralel Scraping
```typescript
// Birden fazla browser instance aç
const queue = new PQueue({ concurrency: 3 });
```

---

## 🔍 Debug Modu

Sorun giderme için headless'i kapat:

```typescript
const tarayici = await puppeteer.launch({
  headless: false, // Browser görünür olur
  devtools: true,  // DevTools açık başlar
});
```

---

## 📝 Yapılacaklar

- [ ] Getir scraper ekle
- [ ] Trendyol scraper ekle
- [ ] Migros scraper ekle
- [ ] CAPTCHA çözümü (2captcha entegrasyonu)
- [ ] Cron job sistemi (otomatik veri çekme)
- [ ] Error logging & monitoring
- [ ] Screenshot alma (hata durumunda)
- [ ] Veri validasyon

---

## 🤝 Destek

Sorularınız için:
- Issue açın (GitHub)
- Documentation'a bakın
- Kod yorumlarını okuyun

---

## 📄 Lisans

MIT - Sadece eğitim amaçlı kullanın!

**⚠️ UYARI:** Production'da kullanmayın, yasal sorumluluk size aittir.
