# Yemek Fiyat Takip - İndirim Agregator MVP

Türkiye'deki yemek siparişi platformlarındaki (Yemeksepeti, Getir, Trendyol Yemek, Migros) indirimleri ve kampanyaları toplayan, sahte indirimleri tespit eden bir platform.

## Özellikler

- 🎯 **İndirim Feed'i**: Bölge bazlı aktif indirimleri gösterir
- 🏷️ **İndirim Kodları**: Tüm platformlardan aktif kupon kodlarını toplar
- ⚠️ **Sahte İndirim Tespiti**: 30 günlük fiyat geçmişine göre sahte indirimleri işaretler
- 🌍 **Çoklu Platform**: Yemeksepeti, Getir, Trendyol, Migros desteği
- 🔄 **Otomatik Güncelleme**: Periyodik scraping ile güncel veriler

## Teknoloji Stack

### Backend (sunucu/)
- NestJS + TypeScript
- Puppeteer (Web Scraping)
- Firebase Admin SDK
- Cheerio (HTML Parsing)

### Frontend (istemci/)
- Next.js 14 + TypeScript
- Tailwind CSS
- Firebase Client SDK
- Lucide Icons

## Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Firebase projesi (ücretsiz plan yeterli)

### 1. Repository Klonlama

\`\`\`bash
git clone <repo-url>
cd yemek-fiyat-takip
\`\`\`

### 2. Backend Kurulumu

\`\`\`bash
cd sunucu
npm install

# Scraping kütüphanelerini ekle
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth cheerio user-agents firebase-admin
\`\`\`

### 3. Firebase Ayarları

1. [Firebase Console](https://console.firebase.google.com/) üzerinden yeni proje oluştur
2. Firestore Database'i etkinleştir (test modunda başlat)
3. Service Account anahtarını indir:
   - Project Settings > Service Accounts > Generate New Private Key
   - İndirilen JSON dosyasını \`sunucu/firebase-service-account.json\` olarak kaydet

4. Koleksiyonları oluştur (otomatik oluşturulacak):
   - \`urunler\` - İndirimli ürünler/restoranlar
   - \`indirimler\` - İndirim kodları

### 4. Frontend Kurulumu

\`\`\`bash
cd ../istemci
npm install
\`\`\`

### 5. Environment Variables

\`istemci/.env.local\` dosyası oluştur:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

Firebase Console > Project Settings > General > Your apps > Web app'ten bu bilgileri alabilirsiniz.

### 6. Test Çalıştırma

Backend scraper'ı test et:

\`\`\`bash
cd sunucu
npx ts-node src/test-indirim-scraper.ts
\`\`\`

Bu komut:
- 4 platformdan indirimleri çekecek
- Sonuçları \`indirim-test-sonuclari.json\` dosyasına kaydedecek
- Firebase'e yükleyecek (eğer yapılandırıldıysa)

### 7. Frontend Başlatma

\`\`\`bash
cd istemci
npm run dev
\`\`\`

Tarayıcıda http://localhost:3000 adresini açın.

## Proje Yapısı

\`\`\`
yemek-fiyat-takip/
├── sunucu/                           # Backend (NestJS)
│   ├── src/
│   │   ├── servisler/
│   │   │   └── scraping/
│   │   │       ├── platformlar/      # Platform scraper'ları
│   │   │       │   ├── yemeksepeti-indirim.scraper.ts
│   │   │       │   ├── getir-indirim.scraper.ts
│   │   │       │   ├── trendyol-indirim.scraper.ts
│   │   │       │   └── migros-indirim.scraper.ts
│   │   │       ├── browser.servis.ts      # Puppeteer yönetimi
│   │   │       ├── proxy.servis.ts        # IP rotasyonu
│   │   │       └── rate-limiter.servis.ts # Rate limiting
│   │   ├── ayarlar/
│   │   │   └── firebase.ayar.ts      # Firebase config
│   │   └── test-indirim-scraper.ts   # Test script
│   └── firebase-service-account.json # Firebase credentials (gitignore'da)
│
├── istemci/                          # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Ana sayfa (Feed)
│   │   │   └── kodlar/
│   │   │       └── page.tsx          # İndirim kodları sayfası
│   │   ├── components/
│   │   │   ├── IndirimKarti.tsx      # İndirim kartı
│   │   │   └── BolgeSecici.tsx       # Bölge seçici
│   │   ├── lib/
│   │   │   └── firebase.ts           # Firebase client
│   │   └── types/
│   │       └── index.ts              # TypeScript tipleri
│   └── .env.local                    # Environment variables (gitignore'da)
│
├── UYGULAMA-KONSEPT.md               # Uygulama konsepti
├── SCRAPING-REHBER.md                # Web scraping rehberi
├── FIREBASE-KURULUM.md               # Firebase kurulum detayları
└── README.md                         # Bu dosya
\`\`\`

## Kullanım Senaryoları

### Senaryo 1: İndirim Avcısı Ayşe

1. Uygulamayı açar
2. Bölgesini seçer (örn: Kadıköy, İstanbul)
3. Feed'de aktif indirimleri görür
4. En yüksek indirimli restoranı seçer
5. "Sipariş Ver" butonuyla platforma yönlendirilir

### Senaryo 2: Kod Arayan Mehmet

1. "İndirim Kodları" sayfasına gider
2. Platformlara göre filtreleme yapar
3. İstediği kodu kopyalar
4. Platform uygulamasında kullanır

## Anti-Ban Stratejileri

Scraper'lar şu teknikleri kullanır:

1. **Rate Limiting**: Platform başına farklı bekleme süreleri
   - Yemeksepeti: 3-7 saniye
   - Getir: 4-8 saniye
   - Trendyol: 3-6 saniye
   - Migros: 2-5 saniye

2. **IP Rotasyonu**: Proxy servisi ile IP değiştirme

3. **Stealth Mode**: Puppeteer-extra-stealth ile bot tespitini engelleme

4. **İnsan Davranışı Simülasyonu**:
   - Rastgele scroll hareketleri
   - Rastgele bekleme süreleri
   - User-Agent rotasyonu

## Firebase Deployment (Opsiyonel)

### Hosting Setup

\`\`\`bash
cd istemci
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
\`\`\`

### Functions (Opsiyonel - Scheduled Scraping)

Backend scraper'ı Cloud Functions olarak deploy edebilirsiniz:

\`\`\`bash
cd sunucu
firebase init functions
# Cloud Scheduler ile günde 2-3 kez çalışacak şekilde ayarlayın
\`\`\`

## Geliştirme Notları

### Proxy Ekleme

\`sunucu/src/servisler/scraping/proxy.servis.ts\` dosyasına proxy ekleyin:

\`\`\`typescript
private proxyListesi: ProxyAyarlari[] = [
  {
    host: 'proxy1.example.com',
    port: 8080,
    kullaniciAdi: 'user',
    sifre: 'pass',
  },
  // Daha fazla proxy...
];
\`\`\`

### Sahte İndirim Algoritması

Gelecek versiyonlarda eklenecek:
- 30 günlük fiyat geçmişi kaydetme
- Ortalama fiyat hesaplama
- Sahte indirim tespit etme (mevcut fiyat < 30 günlük ortalama)

### Yeni Platform Ekleme

1. \`sunucu/src/servisler/scraping/platformlar/\` altında yeni scraper oluştur
2. \`IndirimVerisi\` ve \`IndirimKoduVerisi\` interface'lerini kullan
3. \`kampanyalariCek()\`, \`indirimKodlariCek()\`, \`indirimliRestoranlar()\` metodlarını implement et
4. \`test-indirim-scraper.ts\` dosyasına ekle

## Yasal Uyarı

Bu proje **eğitim amaçlıdır**. Web scraping yapmadan önce:

1. Platformların Terms of Service (TOS) belgelerini okuyun
2. robots.txt dosyalarına uyun
3. Rate limiting uygulayın
4. Kişisel veri toplamayın
5. Ticari kullanım için yasal danışmanlık alın

**ÖNEMLİ**: Platformlar web scraping'i yasaklayabilir. Resmi API'leri kullanmayı tercih edin.

## Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

## Destek

Sorularınız için:
- Issue açın
- Pull request gönderin
- Dokümantasyonu inceleyin

## Roadmap

- [ ] Sahte indirim tespit algoritması
- [ ] Mobil uygulama (React Native)
- [ ] Push notification sistemi
- [ ] Kullanıcı favorileri
- [ ] Fiyat geçmişi grafikleri
- [ ] Tıkla Gelsin platformu ekleme
- [ ] Admin panel
