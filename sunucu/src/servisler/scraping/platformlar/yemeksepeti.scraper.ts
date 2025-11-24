import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BrowserServisi } from '../browser.servis';
import { RateLimiterServisi } from '../rate-limiter.servis';
import { ProxyServisi } from '../proxy.servis';
import { UrunVerisi } from '../../../baglantilar/platform-baglanti.interface';

@Injectable()
export class YemeksepetiScraper {
  private readonly platformKodu = 'yemeksepeti';
  private readonly anaUrl = 'https://www.yemeksepeti.com';

  constructor(
    private browserServisi: BrowserServisi,
    private rateLimiterServisi: RateLimiterServisi,
    private proxyServisi: ProxyServisi,
  ) {}

  // Şehir ve semt seçimi (İstanbul - Kadıköy örneği)
  async konumSec(sayfa: Page, sehir: string = 'istanbul', semt: string = 'kadikoy'): Promise<void> {
    try {
      console.log(`📍 Konum seçiliyor: ${sehir} / ${semt}`);

      // Konum seçim butonunu bekle ve tıkla
      await sayfa.waitForSelector('[data-testid="location-selector"]', { timeout: 10000 });
      await sayfa.click('[data-testid="location-selector"]');

      // Şehir seçimi
      await sayfa.waitForSelector(`[data-city="${sehir}"]`, { timeout: 5000 });
      await sayfa.click(`[data-city="${sehir}"]`);

      // Semt seçimi
      await this.browserServisi.rastgeleBekle(500, 1000);
      await sayfa.waitForSelector(`[data-district="${semt}"]`, { timeout: 5000 });
      await sayfa.click(`[data-district="${semt}"]`);

      console.log(`✅ Konum seçildi: ${sehir} / ${semt}`);
    } catch (hata) {
      console.error('❌ Konum seçim hatası:', hata.message);
      // Konum seçimi başarısız olsa bile devam et
    }
  }

  // Restoran arama
  async restoranAra(aramaMetni: string): Promise<any[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      // Ana sayfaya git
      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);

      // Konum seç
      await this.konumSec(sayfa);

      // Arama yap
      await this.browserServisi.rastgeleBekle(1000, 2000);
      await sayfa.type('input[type="search"]', aramaMetni, { delay: 100 });
      await sayfa.keyboard.press('Enter');

      // Sonuçları bekle
      await sayfa.waitForSelector('.restaurant-card', { timeout: 10000 });

      // İnsan gibi kaydır
      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      // HTML'i al ve parse et
      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const restoranlar = [];

      $('.restaurant-card').each((index, element) => {
        try {
          const restoran = {
            id: $(element).attr('data-restaurant-id'),
            ad: $(element).find('.restaurant-name').text().trim(),
            puan: parseFloat($(element).find('.rating').text().trim()),
            minSiparis: parseFloat(
              $(element)
                .find('.min-order')
                .text()
                .replace(/[^0-9.]/g, ''),
            ),
            teslimatUcreti: parseFloat(
              $(element)
                .find('.delivery-fee')
                .text()
                .replace(/[^0-9.]/g, ''),
            ),
            teslimatSuresi: $(element).find('.delivery-time').text().trim(),
            gorsel: $(element).find('img').attr('src'),
            url: `${this.anaUrl}${$(element).find('a').attr('href')}`,
          };

          restoranlar.push(restoran);
        } catch (parseHata) {
          console.error('Parse hatası:', parseHata.message);
        }
      });

      console.log(`✅ ${restoranlar.length} restoran bulundu`);
      return restoranlar;
    } catch (hata) {
      console.error('❌ Yemeksepeti scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  // Restoran menüsünü çek
  async restoranMenusuCek(restoranUrl: string): Promise<UrunVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      // Restoran sayfasına git
      await this.browserServisi.sayfayaGit(sayfa, restoranUrl);

      // Menü yüklenene kadar bekle
      await sayfa.waitForSelector('.menu-item', { timeout: 10000 });

      // İnsan gibi kaydır
      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      // HTML parse
      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const urunler: UrunVerisi[] = [];

      // Restoran bilgisi
      const restoranAdi = $('.restaurant-header h1').text().trim();
      const restoranId = restoranUrl.split('/').pop();

      $('.menu-item').each((index, element) => {
        try {
          const fiyatMetni = $(element)
            .find('.price')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const indirimFiyatMetni = $(element)
            .find('.discounted-price')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const guncelFiyat = parseFloat(fiyatMetni) || 0;
          const indirimFiyat = indirimFiyatMetni
            ? parseFloat(indirimFiyatMetni)
            : null;

          const urun: UrunVerisi = {
            platformUrunId: $(element).attr('data-product-id') || `${index}`,
            ad: $(element).find('.product-name').text().trim(),
            aciklama: $(element).find('.product-description').text().trim(),
            gorsel: $(element).find('img').attr('src'),
            kategori: $(element).closest('.menu-category').find('h3').text().trim(),
            restoran: restoranAdi,
            restoranId: restoranId,
            guncelFiyat: guncelFiyat,
            indirimFiyat: indirimFiyat,
            indirimOrani: indirimFiyat
              ? Math.round(((guncelFiyat - indirimFiyat) / guncelFiyat) * 100)
              : null,
            stokta: !$(element).hasClass('out-of-stock'),
            platformUrl: restoranUrl,
          };

          urunler.push(urun);
        } catch (parseHata) {
          console.error('Ürün parse hatası:', parseHata.message);
        }
      });

      console.log(`✅ ${urunler.length} ürün çekildi: ${restoranAdi}`);
      return urunler;
    } catch (hata) {
      console.error('❌ Menü scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  // Kampanyaları çek
  async kampanyalariCek(): Promise<any[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      // Kampanyalar sayfasına git
      await this.browserServisi.sayfayaGit(
        sayfa,
        `${this.anaUrl}/kampanyalar`,
      );

      await sayfa.waitForSelector('.campaign-card', { timeout: 10000 });

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const kampanyalar = [];

      $('.campaign-card').each((index, element) => {
        try {
          const kampanya = {
            baslik: $(element).find('.campaign-title').text().trim(),
            aciklama: $(element).find('.campaign-description').text().trim(),
            kod: $(element).find('.coupon-code').text().trim(),
            indirimOrani: parseInt(
              $(element).find('.discount-badge').text().replace(/\D/g, ''),
            ),
            bitisTarihi: $(element).find('.expiry-date').text().trim(),
            gorsel: $(element).find('img').attr('src'),
          };

          kampanyalar.push(kampanya);
        } catch (parseHata) {
          console.error('Kampanya parse hatası:', parseHata.message);
        }
      });

      console.log(`✅ ${kampanyalar.length} kampanya bulundu`);
      return kampanyalar;
    } catch (hata) {
      console.error('❌ Kampanya scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }
}
