# Manuel Kurulum Talimatları

## Sunucuya SSH ile bağlanın:

```bash
ssh root@104.248.30.214
# Şifre: nonroot
```

## Ardından şu komutları sırayla çalıştırın:

### 1. Projeyi GitHub'dan clone edin:
```bash
cd /root
rm -rf yemek-fiyat-takip
git clone https://github.com/huseyindg/yemek-indirim-takip.git yemek-fiyat-takip
cd yemek-fiyat-takip
```

### 2. Deploy script'ini çalıştırın:
```bash
chmod +x deploy.sh
./deploy.sh
```

Bu komut:
- Docker'ı kuracak (eğer yoksa)
- Docker Compose'u kuracak
- Image'ları build edecek (5-10 dakika sürebilir)
- Container'ları başlatacak

### 3. Durumu kontrol edin:
```bash
docker-compose ps
```

## Başarılı kurulum sonrası:

Tarayıcınızda açın:
- **Frontend**: http://104.248.30.214:3000
- **Backend API**: http://104.248.30.214:3001

## Faydalı komutlar:

```bash
# Logları görüntüle
docker-compose logs -f

# Container durumunu kontrol et
docker ps

# Uygulamayı yeniden başlat
docker-compose restart

# Uygulamayı durdur
docker-compose down

# Uygulamayı başlat
docker-compose up -d
```

## Güncelleme (gelecekte):

```bash
cd /root/yemek-fiyat-takip
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Sorun giderme:

Eğer port 3000 veya 3001 kullanımdaysa, `docker-compose.yml` dosyasında portları değiştirin:

```bash
nano docker-compose.yml
# ports kısmını düzenleyin, örn: "3100:3000" veya "3101:3001"
docker-compose up -d
```
