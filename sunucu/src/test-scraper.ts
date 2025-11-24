/**
 * MVP TEST SCRİPTİ
 *
 * Tüm scraper'ları test eder ve Firebase'e kaydeder
 *
 * Kullanım:
 * ts-node src/test-scraper.ts
 */

import { YemeksepetiScraper } from './servisler/scraping/platformlar/yemeksepeti.scraper';
import { GetirScraper } from './servisler/scraping/platformlar/getir.scraper';
import { TrendyolScraper } from './servisler/scraping/platformlar/trendyol.scraper';
import { MigrosScraper } from './servisler/scraping/platformlar/migros.scraper';
import { BrowserServisi } from './servisler/scraping/browser.servis';
import { RateLimiterServisi } from './servisler/scraping/rate-limiter.servis';
import { ProxyServisi } from './servisler/scraping/proxy.servis';
import { collections, timestamp } from './ayarlar/firebase.ayar';

async function main() {
  console.log('🚀 MVP Test Başlatılıyor...\n');

  // Servisleri oluştur
  const proxyServisi = new ProxyServisi();
  const rateLimiterServisi = new RateLimiterServisi();
  const browserServisi = new BrowserServisi(proxyServisi);

  // Scraper'ları oluştur
  const yemeksepetiScraper = new YemeksepetiScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  const getirScraper = new GetirScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  const trendyolScraper = new TrendyolScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  const migrosScraper = new MigrosScraper(
    browserServisi,
    rateLimiterServisi,
    proxyServisi,
  );

  // Test arama kelimesi
  const aramaKelimesi = 'pizza';

  console.log(`🔍 Arama kelimesi: "${aramaKelimesi}"\n`);
  console.log('─'.repeat(60));

  // Tüm sonuçları topla
  const sonuclar = {
    yemeksepeti: { restoranlar: [], urunler: [], hata: null },
    getir: { restoranlar: [], urunler: [], hata: null },
    trendyol: { restoranlar: [], urunler: [], hata: null },
    migros: { restoranlar: [], urunler: [], hata: null },
  };

  // 1. YEMEKSEPETI TEST
  console.log('\n📍 1. YEMEKSEPETI TEST');
  console.log('─'.repeat(60));
  try {
    console.log('🔄 Restoran aranıyor...');
    const restoranlar = await yemeksepetiScraper.restoranAra(aramaKelimesi);
    sonuclar.yemeksepeti.restoranlar = restoranlar;
    console.log(`✅ ${restoranlar.length} restoran bulundu`);

    if (restoranlar.length > 0) {
      console.log(`🔄 İlk restoranın menüsü çekiliyor: ${restoranlar[0].ad}`);
      const urunler = await yemeksepetiScraper.restoranMenusuCek(
        restoranlar[0].url,
      );
      sonuclar.yemeksepeti.urunler = urunler;
      console.log(`✅ ${urunler.length} ürün çekildi`);
    }
  } catch (hata) {
    console.error(`❌ Hata: ${hata.message}`);
    sonuclar.yemeksepeti.hata = hata.message;
  }

  // 2. GETIR TEST
  console.log('\n📍 2. GETIR TEST');
  console.log('─'.repeat(60));
  try {
    console.log('🔄 Restoran aranıyor...');
    const restoranlar = await getirScraper.restoranAra(aramaKelimesi);
    sonuclar.getir.restoranlar = restoranlar;
    console.log(`✅ ${restoranlar.length} restoran bulundu`);

    if (restoranlar.length > 0) {
      console.log(`🔄 İlk restoranın menüsü çekiliyor: ${restoranlar[0].ad}`);
      const urunler = await getirScraper.restoranMenusuCek(restoranlar[0].url);
      sonuclar.getir.urunler = urunler;
      console.log(`✅ ${urunler.length} ürün çekildi`);
    }
  } catch (hata) {
    console.error(`❌ Hata: ${hata.message}`);
    sonuclar.getir.hata = hata.message;
  }

  // 3. TRENDYOL TEST
  console.log('\n📍 3. TRENDYOL TEST');
  console.log('─'.repeat(60));
  try {
    console.log('🔄 Restoran aranıyor...');
    const restoranlar = await trendyolScraper.restoranAra(aramaKelimesi);
    sonuclar.trendyol.restoranlar = restoranlar;
    console.log(`✅ ${restoranlar.length} restoran bulundu`);

    if (restoranlar.length > 0) {
      console.log(`🔄 İlk restoranın menüsü çekiliyor: ${restoranlar[0].ad}`);
      const urunler = await trendyolScraper.restoranMenusuCek(
        restoranlar[0].url,
      );
      sonuclar.trendyol.urunler = urunler;
      console.log(`✅ ${urunler.length} ürün çekildi`);
    }
  } catch (hata) {
    console.error(`❌ Hata: ${hata.message}`);
    sonuclar.trendyol.hata = hata.message;
  }

  // 4. MIGROS TEST
  console.log('\n📍 4. MIGROS TEST');
  console.log('─'.repeat(60));
  try {
    console.log('🔄 Ürünler çekiliyor...');
    const urunler = await migrosScraper.urunleriCek('yemek');
    sonuclar.migros.urunler = urunler.slice(0, 10); // İlk 10 ürün
    console.log(`✅ ${urunler.length} ürün çekildi (ilk 10 kaydedildi)`);
  } catch (hata) {
    console.error(`❌ Hata: ${hata.message}`);
    sonuclar.migros.hata = hata.message;
  }

  // ÖZET
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST ÖZET');
  console.log('='.repeat(60));

  const toplamRestoran =
    sonuclar.yemeksepeti.restoranlar.length +
    sonuclar.getir.restoranlar.length +
    sonuclar.trendyol.restoranlar.length;

  const toplamUrun =
    sonuclar.yemeksepeti.urunler.length +
    sonuclar.getir.urunler.length +
    sonuclar.trendyol.urunler.length +
    sonuclar.migros.urunler.length;

  console.log(`\n✅ Toplam Restoran: ${toplamRestoran}`);
  console.log(`✅ Toplam Ürün: ${toplamUrun}\n`);

  console.log('Platform Detayları:');
  console.log(
    `  • Yemeksepeti: ${sonuclar.yemeksepeti.restoranlar.length} restoran, ${sonuclar.yemeksepeti.urunler.length} ürün`,
  );
  console.log(
    `  • Getir: ${sonuclar.getir.restoranlar.length} restoran, ${sonuclar.getir.urunler.length} ürün`,
  );
  console.log(
    `  • Trendyol: ${sonuclar.trendyol.restoranlar.length} restoran, ${sonuclar.trendyol.urunler.length} ürün`,
  );
  console.log(
    `  • Migros: ${sonuclar.migros.urunler.length} ürün`,
  );

  // Firebase'e kaydet (opsiyonel)
  if (collections.urunler()) {
    console.log('\n💾 Firebase\'e kaydediliyor...');

    try {
      const batch = collections.urunler().firestore.batch();
      let kayitSayisi = 0;

      // Tüm ürünleri Firebase'e kaydet
      const tumUrunler = [
        ...sonuclar.yemeksepeti.urunler.map((u) => ({
          ...u,
          platform: 'yemeksepeti',
        })),
        ...sonuclar.getir.urunler.map((u) => ({ ...u, platform: 'getir' })),
        ...sonuclar.trendyol.urunler.map((u) => ({
          ...u,
          platform: 'trendyol',
        })),
        ...sonuclar.migros.urunler.map((u) => ({ ...u, platform: 'migros' })),
      ];

      tumUrunler.forEach((urun) => {
        const docRef = collections.urunler().doc();
        batch.set(docRef, {
          ...urun,
          olusturulmaTarihi: timestamp(),
          guncellenmeTarihi: timestamp(),
        });
        kayitSayisi++;

        // Firebase batch limiti 500
        if (kayitSayisi >= 500) {
          return;
        }
      });

      await batch.commit();
      console.log(`✅ ${kayitSayisi} ürün Firebase'e kaydedildi`);
    } catch (hata) {
      console.error(`❌ Firebase kayıt hatası: ${hata.message}`);
    }
  } else {
    console.log('\n⚠️  Firebase yapılandırılmamış - veri kaydedilmedi');
    console.log('💡 Firebase kullanmak için:');
    console.log('   1. firebase-admin-key.json dosyasını ekleyin');
    console.log('   2. Firebase projesi oluşturun');
    console.log('   3. Tekrar çalıştırın');
  }

  // Rate limiter istatistikleri
  console.log('\n📈 RATE LIMITER İSTATİSTİKLER');
  console.log('─'.repeat(60));
  const istatistikler = rateLimiterServisi.istatistikleriGetir();
  Object.entries(istatistikler).forEach(([platform, stats]) => {
    console.log(
      `  ${platform}: ${stats.sonDakikadakiIstem}/${stats.limit} istek (son 1 dakika)`,
    );
  });

  console.log('\n✅ Test tamamlandı!');
  console.log('='.repeat(60) + '\n');

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
