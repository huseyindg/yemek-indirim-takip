-- Yemek Fiyat Takip - PostgreSQL Initialization Script
-- Bu script TypeORM tarafından oluşturulacak tabloları hazırlar

-- UUID extension'ı etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Platformları ekle (seed data)
-- Not: Tablolar TypeORM tarafından otomatik oluşturulacak
-- Bu script sadece başlangıç verilerini ekleyecek

DO $$
BEGIN
    -- Platformlar tablosunun varlığını kontrol et ve seed data ekle
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platformlar') THEN
        -- Yemeksepeti
        INSERT INTO platformlar (id, ad, kod, logo, websitesi, aktif, "gunlukIstemSayisi", "maksimumGunlukIstem", "olusturulmaTarihi", "guncellenmeTarihi")
        VALUES (
            uuid_generate_v4(),
            'Yemeksepeti',
            'yemeksepeti',
            'https://www.yemeksepeti.com/favicon.ico',
            'https://www.yemeksepeti.com',
            true,
            0,
            1000,
            NOW(),
            NOW()
        ) ON CONFLICT (kod) DO NOTHING;

        -- Getir
        INSERT INTO platformlar (id, ad, kod, logo, websitesi, aktif, "gunlukIstemSayisi", "maksimumGunlukIstem", "olusturulmaTarihi", "guncellenmeTarihi")
        VALUES (
            uuid_generate_v4(),
            'Getir Yemek',
            'getir',
            'https://getir.com/favicon.ico',
            'https://getir.com/yemek',
            true,
            0,
            1000,
            NOW(),
            NOW()
        ) ON CONFLICT (kod) DO NOTHING;

        -- Trendyol
        INSERT INTO platformlar (id, ad, kod, logo, websitesi, aktif, "gunlukIstemSayisi", "maksimumGunlukIstem", "olusturulmaTarihi", "guncellenmeTarihi")
        VALUES (
            uuid_generate_v4(),
            'Trendyol Yemek',
            'trendyol',
            'https://cdn.dsmcdn.com/favicon.ico',
            'https://www.trendyol.com/yemek',
            true,
            0,
            1000,
            NOW(),
            NOW()
        ) ON CONFLICT (kod) DO NOTHING;

        -- Migros
        INSERT INTO platformlar (id, ad, kod, logo, websitesi, aktif, "gunlukIstemSayisi", "maksimumGunlukIstem", "olusturulmaTarihi", "guncellenmeTarihi")
        VALUES (
            uuid_generate_v4(),
            'Migros Yemek',
            'migros',
            'https://www.migros.com.tr/favicon.ico',
            'https://www.migros.com.tr',
            true,
            0,
            1000,
            NOW(),
            NOW()
        ) ON CONFLICT (kod) DO NOTHING;
    END IF;
END $$;
