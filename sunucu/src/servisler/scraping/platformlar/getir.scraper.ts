import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BrowserServisi } from '../browser.servis';
import { RateLimiterServisi } from '../rate-limiter.servis';
import { ProxyServisi } from '../proxy.servis';
import { UrunVerisi } from '../../../baglantilar/platform-baglanti.interface';

@Injectable()
export class GetirScraper {
  private readonly platformKodu = 'getir';
  private readonly anaUrl = 'https://www.getir.com';

  constructor(
    private browserServisi: BrowserServisi,
    private rateLimiterServisi: RateLimiterServisi,
    private proxyServisi: ProxyServisi,
  ) {}

  // Restoran arama
  async restoranAra(aramaMetni: string): Promise<any[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      // GetirYemek sayfasına git
      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/yemek`);

      // Konum modal'ı varsa geç
      try {
        await sayfa.waitForSelector('[data-testid="close-modal"]', {
          timeout: 3000,
        });
        await sayfa.click('[data-testid="close-modal"]');
      } catch (e) {
        // Modal yoksa devam et
      }

      // Arama yap
      await this.browserServisi.rastgeleBekle(1000, 2000);
      await sayfa.waitForSelector('input[type="search"]', { timeout: 10000 });
      await sayfa.type('input[type="search"]', aramaMetni, { delay: 100 });
      await this.browserServisi.rastgeleBekle(500, 1000);
      await sayfa.keyboard.press('Enter');

      // Sonuçları bekle
      await sayfa.waitForSelector('[data-testid="restaurant-card"]', {
        timeout: 10000,
      });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const restoranlar = [];

      $('[data-testid="restaurant-card"]').each((index, element) => {
        try {
          const restoran = {
            id: $(element).attr('data-restaurant-id'),
            ad: $(element).find('[data-testid="restaurant-name"]').text().trim(),
            puan: parseFloat(
              $(element).find('[data-testid="rating"]').text().trim(),
            ),
            teslimatSuresi: $(element)
              .find('[data-testid="delivery-time"]')
              .text()
              .trim(),
            minSiparis: parseFloat(
              $(element)
                .find('[data-testid="min-order"]')
                .text()
                .replace(/[^0-9.]/g, ''),
            ),
            gorsel: $(element).find('img').attr('src'),
            url: `${this.anaUrl}${$(element).find('a').attr('href')}`,
          };

          restoranlar.push(restoran);
        } catch (e) {
          console.error('Parse hatası:', e.message);
        }
      });

      console.log(`✅ Getir: ${restoranlar.length} restoran bulundu`);
      return restoranlar;
    } catch (hata) {
      console.error('❌ Getir scraping hatası:', hata.message);
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
      await this.browserServisi.sayfayaGit(sayfa, restoranUrl);

      // Menü yüklenene kadar bekle
      await sayfa.waitForSelector('[data-testid="menu-item"]', {
        timeout: 10000,
      });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const restoranAdi = $('[data-testid="restaurant-header"] h1')
        .text()
        .trim();
      const restoranId = restoranUrl.split('/').pop();

      const urunler: UrunVerisi[] = [];

      $('[data-testid="menu-item"]').each((index, element) => {
        try {
          const fiyatStr = $(element)
            .find('[data-testid="price"]')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const urun: UrunVerisi = {
            platformUrunId: $(element).attr('data-product-id') || `${index}`,
            ad: $(element).find('[data-testid="product-name"]').text().trim(),
            aciklama: $(element)
              .find('[data-testid="product-description"]')
              .text()
              .trim(),
            gorsel: $(element).find('img').attr('src'),
            kategori: $(element)
              .closest('[data-testid="category"]')
              .find('h2')
              .text()
              .trim(),
            restoran: restoranAdi,
            restoranId: restoranId,
            guncelFiyat: parseFloat(fiyatStr) || 0,
            indirimFiyat: null,
            indirimOrani: null,
            stokta: !$(element).hasClass('sold-out'),
            platformUrl: restoranUrl,
          };

          urunler.push(urun);
        } catch (e) {
          console.error('Ürün parse hatası:', e.message);
        }
      });

      console.log(`✅ Getir: ${urunler.length} ürün çekildi`);
      return urunler;
    } catch (hata) {
      console.error('❌ Getir menü scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }
}
