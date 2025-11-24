/**
 * İNDİRİM ODAKLI TEST SCRİPTİ
 *
 * Tüm platformlardan:
 * 1. Kampanyaları/İndirimleri çeker
 * 2. İndirim kodlarını toplar
 * 3. İndirimli restoran/ürünleri bulur
 *
 * Kullanım:
 * npx ts-node src/test-indirim-scraper.ts
 */

import { YemeksepetiIndirimScraper } from './servisler/scraping/platformlar/yemeksepeti-indirim.scraper';
import { GetirIndirimScraper } from './servisler/scraping/platformlar/getir-indirim.scraper';
import { TrendyolIndirimScraper } from './servisler/scraping/platformlar/trendyol-indirim.scraper';
import { MigrosIndirimScraper } from './servisler/scraping/platformlar/migros-indirim.scraper';
import { BrowserServisi } from './servisler/scraping/browser.servis';
import { RateLimiterServisi } from './servisler/scraping/rate-limiter.servis';
import { ProxyServisi } from './servisler/scraping/proxy.servis';
import { collections, timestamp } from './ayarlar/firebase.ayar';
import * as fs from 'fs';

async function main() {
  console.log('🎯 İNDİRİM ODAKLI MVP TEST BAŞLATILIYOR...\n');

  // Servisleri oluştur
  const proxyServisi = new ProxyServisi();
  const rateLimiterServisi = new RateLimiterServisi();
  const browserServisi = new BrowserServisi(proxyServisi);

  // Scraper'ları oluştur
  const yemeksepetiScraper = new YemeksepetiIndirimScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  const getirScraper = new GetirIndirimScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  const trendyolScraper = new TrendyolIndirimScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  const migrosScraper = new MigrosIndirimScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  // Test bölgesi
  const bolge = 'kadikoy';
  const sehir = 'istanbul';

  console.log(`📍 Test Bölgesi: ${sehir} / ${bolge}\n`);
  console.log('='.repeat(80));

  // Sonuçları topla
  const sonuclar = {
    yemeksepeti: {
      kampanyalar: [],
      indirimKodlari: [],
      indirimliRestoranlar: [],
      hata: null,
    },
    getir: {
      kampanyalar: [],
      indirimKodlari: [],
      indirimliRestoranlar: [],
      hata: null,
    },
    trendyol: {
      kampanyalar: [],
      indirimKodlari: [],
      indirimliRestoranlar: [],
      hata: null,
    },
    migros: {
      kampanyalar: [],
      indirimKodlari: [],
      indirimliUrunler: [],
      hata: null,
    },
  };

  // 1. YEMEKSEPETI
  console.log('\n🍕 1. YEMEKSEPETİ TEST');
  console.log('─'.repeat(80));

  try {
    console.log('🔄 Kampanyalar çekiliyor...');
    sonuclar.yemeksepeti.kampanyalar = await yemeksepetiScraper.kampanyalariCek(
      bolge,
      sehir,
    );

    console.log('🔄 İndirim kodları çekiliyor...');
    sonuclar.yemeksepeti.indirimKodlari = await yemeksepetiScraper.indirimKodlariCek();

    console.log('🔄 İndirimli restoranlar çekiliyor...');
    sonuclar.yemeksepeti.indirimliRestoranlar = await yemeksepetiScraper.indirimliRestoranlar(
      bolge,
      sehir,
    );

    console.log(`✅ TAMAMLANDI`);
    console.log(
      `   • Kampanyalar: ${sonuclar.yemeksepeti.kampanyalar.length}`,
    );
    console.log(
      `   • İndirim Kodları: ${sonuclar.yemeksepeti.indirimKodlari.length}`,
    );
    console.log(
      `   • İndirimli Restoranlar: ${sonuclar.yemeksepeti.indirimliRestoranlar.length}`,
    );
  } catch (hata) {
    console.error(`❌ HATA: ${hata.message}`);
    sonuclar.yemeksepeti.hata = hata.message;
  }

  // 2. GETIR
  console.log('\n🛵 2. GETIR TEST');
  console.log('─'.repeat(80));

  try {
    console.log('🔄 Kampanyalar çekiliyor...');
    sonuclar.getir.kampanyalar = await getirScraper.kampanyalariCek(
      bolge,
      sehir,
    );

    console.log('🔄 İndirim kodları çekiliyor...');
    sonuclar.getir.indirimKodlari = await getirScraper.indirimKodlariCek();

    console.log('🔄 İndirimli restoranlar çekiliyor...');
    sonuclar.getir.indirimliRestoranlar = await getirScraper.indirimliRestoranlar(
      bolge,
      sehir,
    );

    console.log(`✅ TAMAMLANDI`);
    console.log(`   • Kampanyalar: ${sonuclar.getir.kampanyalar.length}`);
    console.log(
      `   • İndirim Kodları: ${sonuclar.getir.indirimKodlari.length}`,
    );
    console.log(
      `   • İndirimli Restoranlar: ${sonuclar.getir.indirimliRestoranlar.length}`,
    );
  } catch (hata) {
    console.error(`❌ HATA: ${hata.message}`);
    sonuclar.getir.hata = hata.message;
  }

  // 3. TRENDYOL
  console.log('\n🛒 3. TRENDYOL TEST');
  console.log('─'.repeat(80));

  try {
    console.log('🔄 Kampanyalar çekiliyor...');
    sonuclar.trendyol.kampanyalar = await trendyolScraper.kampanyalariCek(
      bolge,
      sehir,
    );

    console.log('🔄 İndirim kodları çekiliyor...');
    sonuclar.trendyol.indirimKodlari = await trendyolScraper.indirimKodlariCek();

    console.log('🔄 İndirimli restoranlar çekiliyor...');
    sonuclar.trendyol.indirimliRestoranlar = await trendyolScraper.indirimliRestoranlar(
      bolge,
      sehir,
    );

    console.log(`✅ TAMAMLANDI`);
    console.log(
      `   • Kampanyalar: ${sonuclar.trendyol.kampanyalar.length}`,
    );
    console.log(
      `   • İndirim Kodları: ${sonuclar.trendyol.indirimKodlari.length}`,
    );
    console.log(
      `   • İndirimli Restoranlar: ${sonuclar.trendyol.indirimliRestoranlar.length}`,
    );
  } catch (hata) {
    console.error(`❌ HATA: ${hata.message}`);
    sonuclar.trendyol.hata = hata.message;
  }

  // 4. MIGROS
  console.log('\n🏪 4. MIGROS TEST');
  console.log('─'.repeat(80));

  try {
    console.log('🔄 Kampanyalar çekiliyor...');
    sonuclar.migros.kampanyalar = await migrosScraper.kampanyalariCek(
      bolge,
      sehir,
    );

    console.log('🔄 İndirim kodları çekiliyor...');
    sonuclar.migros.indirimKodlari = await migrosScraper.indirimKodlariCek();

    console.log('🔄 İndirimli ürünler çekiliyor...');
    sonuclar.migros.indirimliUrunler = await migrosScraper.indirimliUrunler(
      bolge,
      sehir,
    );

    console.log(`✅ TAMAMLANDI`);
    console.log(`   • Kampanyalar: ${sonuclar.migros.kampanyalar.length}`);
    console.log(
      `   • İndirim Kodları: ${sonuclar.migros.indirimKodlari.length}`,
    );
    console.log(
      `   • İndirimli Ürünler: ${sonuclar.migros.indirimliUrunler.length}`,
    );
  } catch (hata) {
    console.error(`❌ HATA: ${hata.message}`);
    sonuclar.migros.hata = hata.message;
  }

  // ÖZET
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST ÖZET');
  console.log('='.repeat(80));

  const toplamKampanya =
    sonuclar.yemeksepeti.kampanyalar.length +
    sonuclar.getir.kampanyalar.length +
    sonuclar.trendyol.kampanyalar.length +
    sonuclar.migros.kampanyalar.length;

  const toplamKod =
    sonuclar.yemeksepeti.indirimKodlari.length +
    sonuclar.getir.indirimKodlari.length +
    sonuclar.trendyol.indirimKodlari.length +
    sonuclar.migros.indirimKodlari.length;

  const toplamIndirimliRestoran =
    sonuclar.yemeksepeti.indirimliRestoranlar.length +
    sonuclar.getir.indirimliRestoranlar.length +
    sonuclar.trendyol.indirimliRestoranlar.length +
    sonuclar.migros.indirimliUrunler.length;

  console.log(`\n✅ Toplam Kampanya/İndirim: ${toplamKampanya}`);
  console.log(`✅ Toplam İndirim Kodu: ${toplamKod}`);
  console.log(`✅ Toplam İndirimli Restoran/Ürün: ${toplamIndirimliRestoran}\n`);

  console.log('Platform Detayları:');
  console.log(
    `  🍕 Yemeksepeti: ${sonuclar.yemeksepeti.kampanyalar.length} kampanya, ${sonuclar.yemeksepeti.indirimKodlari.length} kod, ${sonuclar.yemeksepeti.indirimliRestoranlar.length} restoran`,
  );
  console.log(
    `  🛵 Getir: ${sonuclar.getir.kampanyalar.length} kampanya, ${sonuclar.getir.indirimKodlari.length} kod, ${sonuclar.getir.indirimliRestoranlar.length} restoran`,
  );
  console.log(
    `  🛒 Trendyol: ${sonuclar.trendyol.kampanyalar.length} kampanya, ${sonuclar.trendyol.indirimKodlari.length} kod, ${sonuclar.trendyol.indirimliRestoranlar.length} restoran`,
  );
  console.log(
    `  🏪 Migros: ${sonuclar.migros.kampanyalar.length} kampanya, ${sonuclar.migros.indirimKodlari.length} kod, ${sonuclar.migros.indirimliUrunler.length} ürün`,
  );

  // JSON'a kaydet
  console.log('\n💾 Sonuçlar kaydediliyor...');

  const kayitVerisi = {
    test_tarihi: new Date().toISOString(),
    bolge: `${sehir}/${bolge}`,
    ozet: {
      toplam_kampanya: toplamKampanya,
      toplam_kod: toplamKod,
      toplam_indirimli: toplamIndirimliRestoran,
    },
    detay: sonuclar,
  };

  fs.writeFileSync(
    'indirim-test-sonuclari.json',
    JSON.stringify(kayitVerisi, null, 2),
    'utf-8',
  );

  console.log('✅ indirim-test-sonuclari.json dosyasına kaydedildi');

  // Firebase'e kaydet (opsiyonel)
  if (collections.urunler()) {
    console.log('\n🔥 Firebase\'e kaydediliyor...');

    try {
      const batch = collections.urunler().firestore.batch();
      let kayitSayisi = 0;

      // Tüm kampanyaları Firebase'e kaydet
      const tumKampanyalar = [
        ...sonuclar.yemeksepeti.kampanyalar,
        ...sonuclar.getir.kampanyalar,
        ...sonuclar.trendyol.kampanyalar,
        ...sonuclar.migros.kampanyalar,
      ];

      tumKampanyalar.forEach((kampanya) => {
        if (kayitSayisi >= 500) return; // Firebase batch limiti

        const docRef = collections.urunler().doc();
        batch.set(docRef, {
          ...kampanya,
          tip: 'kampanya',
          olusturulmaTarihi: timestamp(),
        });
        kayitSayisi++;
      });

      await batch.commit();
      console.log(`✅ ${kayitSayisi} kampanya Firebase'e kaydedildi`);

      // İndirim kodlarını kaydet
      const indirimBatch = collections.indirimler().firestore.batch();
      let kodSayisi = 0;

      const tumKodlar = [
        ...sonuclar.yemeksepeti.indirimKodlari,
        ...sonuclar.getir.indirimKodlari,
        ...sonuclar.trendyol.indirimKodlari,
        ...sonuclar.migros.indirimKodlari,
      ];

      tumKodlar.forEach((kod) => {
        if (kodSayisi >= 500) return;

        const docRef = collections.indirimler().doc();
        indirimBatch.set(docRef, {
          ...kod,
          olusturulmaTarihi: timestamp(),
        });
        kodSayisi++;
      });

      await indirimBatch.commit();
      console.log(`✅ ${kodSayisi} indirim kodu Firebase'e kaydedildi`);
    } catch (hata) {
      console.error(`❌ Firebase kayıt hatası: ${hata.message}`);
    }
  } else {
    console.log('\n⚠️  Firebase yapılandırılmamış - sadece JSON\'a kaydedildi');
  }

  // Rate limiter istatistikleri
  console.log('\n📈 RATE LIMITER İSTATİSTİKLER');
  console.log('─'.repeat(80));
  const istatistikler = rateLimiterServisi.istatistikleriGetir();
  Object.entries(istatistikler).forEach(([platform, stats]) => {
    console.log(
      `  ${platform}: ${stats.sonDakikadakiIstem}/${stats.limit} istek (son 1 dakika)`,
    );
  });

  console.log('\n✅ TEST TAMAMLANDI!');
  console.log('='.repeat(80) + '\n');

  // Cleanup
  await browserServisi.tumTarayicilariKapat();
  process.exit(0);
}

// Hata yakalama
process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Çalıştır
main().catch((hata) => {
  console.error('❌ Fatal error:', hata);
  process.exit(1);
});
