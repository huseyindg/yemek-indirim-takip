# 🎯 Yemek Fiyat Takip - Uygulama Konsepti

## 💡 Ana Fikir

**"Türkiye'deki tüm yemek platformlarındaki GERÇEK indirimleri tek yerden gör!"**

## 📱 Kullanıcı Akışı

### 1. Giriş Sayfası
```
┌─────────────────────────────────────┐
│   🍕 Yemek İndirim Avcısı           │
│                                     │
│   📍 Bölgenizi seçin:               │
│   [Kadıköy, İstanbul        ▼]     │
│                                     │
│   [Devam Et]                        │
└─────────────────────────────────────┘
```

### 2. Ana Sayfa (Feed)
```
┌─────────────────────────────────────┐
│  ← 📍 Kadıköy                       │
│  ╔════════════════════════════════╗ │
│  ║ 🔥 BUGÜN                       ║ │
│  ╚════════════════════════════════╝ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🍕 Domino's Pizza           │   │
│  │ 📍 Yemeksepeti              │   │
│  │                             │   │
│  │ 🎯 %40 İndirim              │   │
│  │ 💰 89₺ → 53₺                │   │
│  │                             │   │
│  │ ⚠️ Gerçek İndirim           │   │
│  │ 📊 Son 30 günde ortalama:   │   │
│  │    95₺ (şimdi %44 ucuz!)    │   │
│  │                             │   │
│  │ [Sipariş Ver →]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🍔 Burger King              │   │
│  │ 📍 Getir                    │   │
│  │                             │   │
│  │ 🎯 %50 İNDİRİM!             │   │
│  │ 💰 120₺ → 60₺               │   │
│  │                             │   │
│  │ ⚠️ SAHTE İNDİRİM!           │   │
│  │ 📊 Son 30 günde ortalama:   │   │
│  │    65₺ (aslında pahalı!)    │   │
│  │                             │   │
│  │ [❌ Önerilmez]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ╔════════════════════════════════╗ │
│  ║ 🕐 DÜN                         ║ │
│  ╚════════════════════════════════╝ │
│                                     │
│  [Daha fazla yükle...]              │
└─────────────────────────────────────┘
```

### 3. İndirim Kodları Sayfası
```
┌─────────────────────────────────────┐
│  🎫 Aktif İndirim Kodları           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ YEMEK40                     │   │
│  │                             │   │
│  │ 🏪 Yemeksepeti              │   │
│  │ 🎯 %40 indirim              │   │
│  │ 💵 Min: 100₺                │   │
│  │ 📅 31 Mart'a kadar          │   │
│  │                             │   │
│  │ ✅ 1,234 kişi kullandı      │   │
│  │ 👍 %89 çalıştı              │   │
│  │                             │   │
│  │ [Kodu Kopyala] [Kullan]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ GETIR20                     │   │
│  │                             │   │
│  │ 🏪 Getir                    │   │
│  │ 🎯 20₺ indirim              │   │
│  │ 💵 Min: 50₺                 │   │
│  │ 📅 Sadece bugün!            │   │
│  │                             │   │
│  │ ⭐ Yeni kullanıcılar için   │   │
│  │                             │   │
│  │ [Kodu Kopyala] [Kullan]    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎯 Ana Özellikler

### 1. İndirim Feed'i
```typescript
interface Indirim {
  id: string;
  platform: 'yemeksepeti' | 'getir' | 'trendyol' | 'migros';
  restoran: string;
  urunAdi?: string;
  gorsel: string;

  // Fiyat bilgileri
  eskiFiyat: number;
  yeniFiyat: number;
  indirimOrani: number;

  // Sahte indirim tespiti
  sahteIndirim: boolean;
  ortalama30Gunluk: number;
  gercekIndirimOrani: number;

  // Lokasyon
  bolge: string;
  sehir: string;

  // Meta
  olusturulmaTarihi: Date;
  bitisTarihi?: Date;
  aktif: boolean;
}
```

### 2. İndirim Kodları
```typescript
interface IndirimKodu {
  id: string;
  kod: string;
  platform: string;

  baslik: string;
  aciklama: string;

  // İndirim detayları
  indirimTuru: 'yuzde' | 'sabit';
  indirimMiktari: number;
  minimumSiparis?: number;
  maksimumIndirim?: number;

  // Kullanılabilirlik
  yeniKullaniciIcin: boolean;
  kullanimSayisi: number;
  basarliKullanimYuzdesi: number;

  // Tarih
  baslangicTarihi: Date;
  bitisTarihi?: Date;
  aktif: boolean;
}
```

### 3. Bölge Sistemi
```typescript
interface Bolge {
  id: string;
  sehir: string;
  semt: string;
  mahalle?: string;
  koordinat: {
    enlem: number;
    boylam: number;
  };
}
```

---

## 🔍 Scraper Stratejisi (Yeniden)

### Ne Çekeceğiz?

#### 1. Kampanya/İndirim Sayfaları
```
✅ Yemeksepeti → /kampanyalar
✅ Getir → /promotions
✅ Trendyol → /deals
✅ Migros → /firsatlar
```

#### 2. Her Platform İçin
```typescript
// Çekilecek veriler
{
  // Genel kampanyalar
  kampanyalar: Kampanya[],

  // Restoran özel indirimler
  restoranIndirimleri: RestoranIndirim[],

  // İndirim kodları
  indirimKodlari: IndirimKodu[],

  // Bölge bazlı kampanyalar
  bolgeCampanyalari: BolgeCampanya[]
}
```

#### 3. Fiyat Geçmişi Analizi
```typescript
// Her indirim için
function sahteIndirimKontrol(indirim) {
  const gecmis = fiyatGecmisi(indirim.urunId, 30); // Son 30 gün
  const ortalama = hesaplaOrtalama(gecmis);

  if (indirim.yeniFiyat >= ortalama * 0.95) {
    return {
      sahteIndirim: true,
      uyari: "Bu fiyat son 30 günlük ortalamaya yakın!"
    };
  }

  return {
    sahteIndirim: false,
    gercekIndirim: ((ortalama - indirim.yeniFiyat) / ortalama) * 100
  };
}
```

---

## 📊 Database Schema (Firebase Firestore)

```
indirimleri/
├── {indirimId}
│   ├── platform: "yemeksepeti"
│   ├── restoran: "Domino's"
│   ├── urunAdi: "Büyük Boy Pizza"
│   ├── eskiFiyat: 89
│   ├── yeniFiyat: 53
│   ├── indirimOrani: 40
│   ├── sahteIndirim: false
│   ├── bolge: "kadikoy"
│   ├── sehir: "istanbul"
│   ├── gorsel: "..."
│   ├── olusturulmaTarihi: timestamp
│   └── aktif: true

indirimKodlari/
├── {kodId}
│   ├── kod: "YEMEK40"
│   ├── platform: "yemeksepeti"
│   ├── indirimMiktari: 40
│   ├── minimumSiparis: 100
│   ├── bitisTarihi: timestamp
│   └── aktif: true

fiyatGecmisi/
└── {urunId}/
    └── fiyatlar/
        ├── {tarih1}: { fiyat: 89, ... }
        ├── {tarih2}: { fiyat: 92, ... }
        └── {tarih3}: { fiyat: 53, ... }
```

---

## 🎨 Frontend Mockup

### Ana Sayfa Filtreleri
```
┌────────────────────────────────────┐
│ 📍 Kadıköy, İstanbul        [▼]   │
├────────────────────────────────────┤
│ 🔍 Filtreler:                      │
│                                    │
│ Platform:                          │
│ [Tümü] [Yemeksepeti] [Getir]     │
│ [Trendyol] [Migros]               │
│                                    │
│ İndirim Oranı:                    │
│ [Tümü] [%20+] [%30+] [%50+]       │
│                                    │
│ Sıralama:                         │
│ [◉] Yeniden Eskiye                │
│ [○] İndirim Oranına Göre          │
│ [○] En Popüler                    │
└────────────────────────────────────┘
```

### İndirim Kartı Detayı
```
┌────────────────────────────────────┐
│ [Resim]                            │
│                                    │
│ 🍕 Domino's Pizza                  │
│ Medium Boy Karışık Pizza           │
│                                    │
│ 📍 Yemeksepeti · Kadıköy           │
│                                    │
│ ┌─────────────┬────────────────┐  │
│ │ Eski Fiyat  │ Yeni Fiyat     │  │
│ │ ~~89₺~~     │ 53₺ %40 ⬇      │  │
│ └─────────────┴────────────────┘  │
│                                    │
│ ✅ GERÇEK İNDİRİM                  │
│ 📊 Son 30 gün ortalama: 95₺        │
│ 💡 Şimdi %44 daha ucuz!            │
│                                    │
│ ⏰ 2 saat önce eklendi             │
│ 👍 234 kişi beğendi               │
│                                    │
│ [🛒 Sipariş Ver] [♡ Kaydet]       │
└────────────────────────────────────┘
```

---

## 🚀 MVP Yol Haritası

### Faz 1: Backend (İndirim Scraping) ✅
- [x] Scraper altyapısı
- [ ] **Kampanya sayfası scraping**
- [ ] **İndirim kodu toplama**
- [ ] **Bölge bazlı filtreleme**
- [ ] Sahte indirim algoritması
- [ ] Firebase entegrasyonu

### Faz 2: Frontend (Feed UI)
- [ ] Next.js kurulum
- [ ] Feed tasarımı (Instagram benzeri)
- [ ] İndirim kartları
- [ ] Bölge seçici
- [ ] Filtre sistemi
- [ ] İndirim kodları sayfası

### Faz 3: Özellikler
- [ ] Kullanıcı kayıt/giriş
- [ ] Favori indirimler
- [ ] Bildirim sistemi
- [ ] Sosyal özellikler (beğeni, yorum)
- [ ] İndirim paylaşma

---

## 💡 Kullanıcı Senaryoları

### Senaryo 1: İndirim Avcısı Ayşe
```
1. Ayşe akşam yemeği için ne sipariş edeceğini düşünüyor
2. Uygulamayı açıyor, bölgesini (Kadıköy) seçiyor
3. O gün eklenen tüm indirimleri görüyor
4. %40 indirimli Domino's görüyor
5. "Gerçek indirim" rozeti var → güveniyor
6. "Sipariş Ver" → Yemeksepeti'ne yönleniyor
7. Siparişini veriyor
```

### Senaryo 2: Kod Arayan Mehmet
```
1. Mehmet Getir'den sipariş verecek
2. "İndirim kodları" bölümüne giriyor
3. Getir için aktif kodları görüyor
4. "GETIR20" kodunu kopyalıyor
5. Getir uygulamasında kullanıyor
6. 20₺ kazanıyor
7. Geri dönüp uygulamaya 👍 veriyor
```

### Senaryo 3: Sahte İndirim Tespiti
```
1. Kullanıcı %50 indirim görüyor
2. "Sahte İndirim!" uyarısı var
3. Grafik gösteriyor: Son 30 günde fiyat 60₺'ydi
4. Şimdi "indirimli" 60₺ → aslında normal fiyat
5. Kullanıcı aldanmıyor
```

---

## 🎯 Başarı Metrikleri

```
✅ Günlük aktif kullanıcı: 1000+
✅ Her gün yeni indirim sayısı: 50+
✅ İndirim doğrulama oranı: %95+
✅ Kullanıcı memnuniyeti: %90+
```

---

Bu konsept doğru mu? Şimdi bu yapıya göre devam edeyim mi? 🚀
