# Deployment Rehberi - Firebase Hosting

Bu rehber, uygulamayı Firebase Hosting'e deploy etmek için gereken adımları içerir.

## Gereksinimler

- Tamamlanmış Firebase projesi
- Firebase CLI yüklü
- Çalışan Next.js uygulaması

## Adım 1: Firebase CLI Kurulumu

```bash
npm install -g firebase-tools
```

Kurulumu kontrol et:

```bash
firebase --version
```

## Adım 2: Firebase Login

```bash
firebase login
```

Tarayıcıda Google hesabınızla giriş yapın.

## Adım 3: Firebase Hosting Başlatma

Proje kök dizininde:

```bash
cd c:/projects/yemek-fiyat-takip/istemci
firebase init hosting
```

Sorulan sorulara cevaplar:

1. Select a default Firebase project: Oluşturduğunuz projeyi seçin
2. What do you want to use as your public directory? → out
3. Configure as a single-page app? → Yes
4. Set up automatic builds with GitHub? → No
5. File out/index.html already exists. Overwrite? → No

## Adım 4: Next.js Static Export Yapılandırma

istemci/next.config.js dosyasını oluştur/güncelle.

## Adım 5: Build ve Export

```bash
cd c:/projects/yemek-fiyat-takip/istemci
npm run build
```

Bu komut out/ klasöründe static dosyalar oluşturur.

## Adım 6: Deploy

```bash
firebase deploy --only hosting
```

Deploy tamamlandığında hosting URL'nizi alacaksınız.

## Maliyet Tahmini (Firebase Ücretsiz Plan)

### Spark Plan (Ücretsiz)

- Hosting: 10 GB depolama, 360 MB/gün bandwidth
- Firestore: 1 GB depolama, 50K okuma/gün, 20K yazma/gün
- Yeterli mi? Evet, MVP için yeterli

### Blaze Plan (Kullandıkça Öde)

Tahmini Aylık Maliyet (1000 kullanıcı için):
- Hosting: ~$0
- Firestore: ~$1-2
- Cloud Functions: ~$5-10
- TOPLAM: ~$6-12/ay

## Monitoring

Firebase Console'dan:
- Hosting > Dashboard - Traffic grafikleri
- Firestore > Usage - Read/Write operations
- Functions > Logs - Execution logs

## Güvenlik

Production'da firestore.rules dosyasını güncelle:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /urunler/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /indirimler/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Deploy et:

```bash
firebase deploy --only firestore:rules
```

## Deployment Checklist

- [ ] Firebase projesi oluşturuldu
- [ ] Firebase CLI yüklendi ve login yapıldı
- [ ] Next.js static export yapılandırıldı
- [ ] Production environment variables ayarlandı
- [ ] Build başarılı (npm run build)
- [ ] Firebase hosting başlatıldı
- [ ] İlk deploy yapıldı
- [ ] Firestore rules güncellendi
- [ ] Custom domain eklendi (opsiyonel)
- [ ] Monitoring kuruldu

Deployment tamamlandı! 🚀
