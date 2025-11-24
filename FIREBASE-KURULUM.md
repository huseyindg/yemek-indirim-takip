# 🔥 Firebase Kurulum Rehberi

## Neden Firebase?

```
✅ Kolay kurulum - 5 dakika
✅ Ücretsiz tier - Küçük projeler için yeterli
✅ Database (Firestore) dahil
✅ Hosting dahil - Deploy 1 komut
✅ Authentication hazır
✅ Real-time database
✅ Cloud Functions (serverless)
❌ PostgreSQL kadar güçlü değil (büyük projeler için)
```

---

## 📋 Adım 1: Firebase Projesi Oluşturma

### 1. Firebase Console'a Git
https://console.firebase.google.com/

### 2. Yeni Proje Oluştur
1. **"Add project"** butonuna tıkla
2. **Proje adı:** `yemek-fiyat-takip`
3. **Google Analytics:** İsteğe bağlı (şimdilik kapalı tutabilirsiniz)
4. **Create Project**

### 3. Firestore Database Oluştur
1. Sol menüden **"Firestore Database"** seç
2. **"Create database"**
3. **Production mode** (güvenlik kuralları sonra ayarlanır)
4. **Location:** `europe-west3` (Frankfurt - Türkiye'ye yakın)

### 4. Firebase Config Bilgilerini Al
1. Sol menüden **⚙️ Project Settings**
2. **"General"** tab
3. Scroll down → **"Your apps"** kısmı
4. **Web app** (</> ikonu) seç
5. App adı: `yemek-fiyat-takip-web`
6. Firebase Hosting: ✅ İşaretle
7. **Config object**'i kopyala:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "yemek-fiyat-takip.firebaseapp.com",
  projectId: "yemek-fiyat-takip",
  storageBucket: "yemek-fiyat-takip.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};
```

### 5. Service Account Key (Backend için)
1. **Project Settings** → **Service Accounts**
2. **Generate new private key**
3. JSON dosyasını indir
4. **ÖNEMLİ:** Bu dosyayı `firebase-admin-key.json` olarak kaydet
5. **ASLA GIT'E EKLEME!**

---

## 📦 Adım 2: Backend Firebase Kurulumu

### 1. Firebase Admin SDK Yükle

```bash
cd c:/projects/yemek-fiyat-takip/sunucu
npm install firebase-admin
```

### 2. Firebase Config Dosyası Oluştur

`sunucu/src/ayarlar/firebase.ayar.ts`:
```typescript
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../firebase-admin-key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: `https://yemek-fiyat-takip.firebaseio.com`,
});

export const db = admin.firestore();
export const auth = admin.auth();

console.log('🔥 Firebase başlatıldı');
```

### 3. .gitignore'a Ekle

```bash
# Firebase private key
firebase-admin-key.json
```

### 4. Firestore Koleksiyonları

```
📁 Firestore Database
├── platformlar/          # Platform bilgileri
│   ├── yemeksepeti
│   ├── getir
│   └── trendyol
├── urunler/             # Ürün verileri
│   ├── {urunId}
│   └── ...
├── fiyatGecmisi/        # Fiyat geçmişi (subcollection)
│   └── {urunId}/fiyatlar/{tarih}
└── indirimler/          # İndirim kodları
    ├── {indirimId}
    └── ...
```

---

## 🎨 Adım 3: Frontend Firebase Kurulumu

### 1. Firebase Web SDK Yükle

```bash
cd c:/projects/yemek-fiyat-takip/istemci
npm install firebase
```

### 2. Firebase Config Dosyası

`istemci/src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIza...", // Buraya kendi config'inizi koyun
  authDomain: "yemek-fiyat-takip.firebaseapp.com",
  projectId: "yemek-fiyat-takip",
  storageBucket: "yemek-fiyat-takip.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## 🚀 Adım 4: Firebase Hosting Deployment

### 1. Firebase CLI Kur

```bash
npm install -g firebase-tools
```

### 2. Firebase Login

```bash
firebase login
```

### 3. Firebase Init

```bash
cd c:/projects/yemek-fiyat-takip
firebase init
```

**Seçenekler:**
```
? Which Firebase features?
  ◉ Firestore
  ◉ Hosting
  ◯ Functions (şimdilik gerek yok)

? Use an existing project?
  → yemek-fiyat-takip

? What file should be used for Firestore Rules?
  → firestore.rules

? What file should be used for Firestore indexes?
  → firestore.indexes.json

? What do you want to use as your public directory?
  → istemci/out (Next.js static export için)

? Configure as a single-page app?
  → Yes

? Set up automatic builds and deploys with GitHub?
  → No (şimdilik manuel)
```

### 4. Deploy

```bash
# Frontend build
cd istemci
npm run build

# Firebase deploy
cd ..
firebase deploy
```

---

## 💰 Firebase Ücretsiz Limits

### Spark Plan (Ücretsiz)

| Özellik | Limit |
|---------|-------|
| **Firestore** | 1 GB storage, 50K okuma/gün, 20K yazma/gün |
| **Hosting** | 10 GB/ay transfer, 1 GB storage |
| **Functions** | 125K çağrı/ay, 40K GB-saniye |
| **Authentication** | Sınırsız kullanıcı |

**⚠️ Not:** Scraping yoğun kullanımda limitleri aşabilir!

---

## 🔒 Firestore Security Rules

`firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read - herkes okuyabilir
    match /urunler/{urunId} {
      allow read: if true;
      allow write: if false; // Sadece admin/backend yazabilir
    }

    match /platformlar/{platformId} {
      allow read: if true;
      allow write: if false;
    }

    match /indirimler/{indirimId} {
      allow read: if true;
      allow write: if request.auth != null; // Login olmuş kullanıcılar
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Firestore vs PostgreSQL

| Özellik | Firestore | PostgreSQL |
|---------|-----------|------------|
| **Kurulum** | ✅ 5 dakika | ❌ 30 dakika+ |
| **Ölçekleme** | ✅ Otomatik | ⚠️ Manuel |
| **Fiyat** | ✅ Ücretsiz başlangıç | ⚠️ Sunucu gerekli |
| **SQL Sorguları** | ❌ Sınırlı | ✅ Güçlü |
| **Realtime** | ✅ Var | ❌ Yok (ek kütüphane gerekir) |
| **İlişkisel Veri** | ⚠️ Zor | ✅ Doğal |

---

## 🎯 Şimdi Yapılacaklar

1. ✅ Firebase Console'da proje oluştur
2. ✅ Service Account key indir
3. ✅ Backend'e firebase-admin kur
4. ✅ Frontend'e firebase kur
5. ✅ Firebase config ayarla
6. ✅ Firestore security rules ayarla
7. ✅ Deploy et!

---

## 🆘 Sorun Giderme

### Hata: "Permission denied"
```bash
# Security rules'u kontrol et
firebase deploy --only firestore:rules
```

### Hata: "Quota exceeded"
```bash
# Ücretsiz limiti aştınız
# Firebase Console → Usage and billing
```

### Deploy Hatası
```bash
# Cache temizle
npm run clean
npm run build
firebase deploy --debug
```

---

## 📞 Yardım

- Firebase Docs: https://firebase.google.com/docs
- Firestore Guide: https://firebase.google.com/docs/firestore
- Stack Overflow: Tag `firebase`

---

Hazır mısınız? Firebase projesi oluşturdunuz mu? 🚀
