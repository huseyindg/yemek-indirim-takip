#!/bin/bash

# Yemek Fiyat Takip - Deployment Script
# Sunucuda çalıştırılacak script

set -e

echo "🚀 Yemek Fiyat Takip Deployment Başlıyor..."

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Gerekli yazılımları kontrol et
echo -e "${YELLOW}📦 Gerekli yazılımları kontrol ediliyor...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker bulunamadı. Docker kurulumu yapılıyor...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker kuruldu${NC}"
else
    echo -e "${GREEN}✅ Docker mevcut${NC}"
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose bulunamadı. Kurulum yapılıyor...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose kuruldu${NC}"
else
    echo -e "${GREEN}✅ Docker Compose mevcut${NC}"
fi

# 2. Proje dizinine git
PROJECT_DIR="/root/yemek-fiyat-takip"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}📁 Proje dizini oluşturuluyor...${NC}"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# 3. Eğer Git repo varsa pull, yoksa manuel upload edilmiş dosyaları kullan
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Git deposu güncelleniyor...${NC}"
    git pull
    echo -e "${GREEN}✅ Git güncellemesi tamamlandı${NC}"
else
    echo -e "${YELLOW}📦 Manuel upload kullanılıyor (Git repo yok)${NC}"
fi

# 4. Eski container'ları durdur
echo -e "${YELLOW}🛑 Eski container'lar durduruluyor...${NC}"
docker-compose down || true

# 5. Docker image'larını oluştur
echo -e "${YELLOW}🔨 Docker image'ları oluşturuluyor...${NC}"
docker-compose build --no-cache

# 6. Container'ları başlat
echo -e "${YELLOW}🚀 Container'lar başlatılıyor...${NC}"
docker-compose up -d

# 7. Container'ların durumunu kontrol et
echo -e "${YELLOW}⏳ Container'ların hazır olması bekleniyor...${NC}"
sleep 10

# 8. Logları göster
echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${YELLOW}📋 Container durumları:${NC}"
docker-compose ps

echo -e "\n${GREEN}🎉 Uygulama başarıyla deploy edildi!${NC}"
echo -e "${YELLOW}📍 Frontend: http://104.248.30.214:3000${NC}"
echo -e "${YELLOW}📍 Backend API: http://104.248.30.214:3001${NC}"
echo -e "\n${YELLOW}📊 Logları görüntülemek için:${NC}"
echo -e "   docker-compose logs -f"
echo -e "\n${YELLOW}🛑 Durdurmak için:${NC}"
echo -e "   docker-compose down"
