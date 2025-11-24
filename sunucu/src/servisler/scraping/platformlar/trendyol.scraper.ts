import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BrowserServisi } from '../browser.servis';
import { RateLimiterServisi } from '../rate-limiter.servis';
import { ProxyServisi } from '../proxy.servis';
import { UrunVerisi } from '../../../baglantilar/platform-baglanti.interface';

@Injectable()
export class TrendyolScraper {
  private readonly platformKodu = 'trendyol';
  private readonly anaUrl = 'https://www.trendyolyemek.com';

  constructor(
    private browserServisi: BrowserServisi,
    private rateLimiterServisi: RateLimiterServisi,
    private proxyServisi: ProxyServisi,
  ) {}

  async restoranAra(aramaMetni: string): Promise<any[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);
      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);

      // Konum seçimi (gerekirse)
      try {
        await sayfa.waitForSelector('[data-testid="address-input"]', {
          timeout: 3000,
        });
        await sayfa.click('[data-testid="address-input"]');
        await sayfa.type('[data-testid="address-input"]', 'Kadıköy, İstanbul');
        await this.browserServisi.rastgeleBekle(500, 1000);
        await sayfa.keyboard.press('Enter');
      } catch (e) {
        // Konum zaten seçilmiş olabilir
      }

      // Arama
      await this.browserServisi.rastgeleBekle(1000, 2000);
      await sayfa.type('input[placeholder*="Ara"]', aramaMetni, { delay: 100 });
      await sayfa.keyboard.press('Enter');

      await sayfa.waitForSelector('.restaurant-list-item', { timeout: 10000 });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const restoranlar = [];

      $('.restaurant-list-item').each((index, element) => {
        try {
          const restoran = {
            id: $(element).attr('data-id'),
            ad: $(element).find('.restaurant-name').text().trim(),
            puan: parseFloat($(element).find('.rating-score').text().trim()),
            minSiparis: parseFloat(
              $(element)
                .find('.min-basket')
                .text()
                .replace(/[^0-9.]/g, ''),
            ),
            teslimatUcreti: parseFloat(
              $(element)
                .find('.delivery-fee')
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

      console.log(`✅ Trendyol: ${restoranlar.length} restoran bulundu`);
      return restoranlar;
    } catch (hata) {
      console.error('❌ Trendyol scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  async restoranMenusuCek(restoranUrl: string): Promise<UrunVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);
      await this.browserServisi.sayfayaGit(sayfa, restoranUrl);

      await sayfa.waitForSelector('.product-card', { timeout: 10000 });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const restoranAdi = $('.restaurant-detail-header h1').text().trim();
      const restoranId = restoranUrl.split('/').pop();

      const urunler: UrunVerisi[] = [];

      $('.product-card').each((index, element) => {
        try {
          const fiyatStr = $(element)
            .find('.product-price')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const urun: UrunVerisi = {
            platformUrunId: $(element).attr('data-id') || `${index}`,
            ad: $(element).find('.product-name').text().trim(),
            aciklama: $(element).find('.product-description').text().trim(),
            gorsel: $(element).find('img').attr('src'),
            kategori: $(element)
              .closest('.category-section')
              .find('h3')
              .text()
              .trim(),
            restoran: restoranAdi,
            restoranId: restoranId,
            guncelFiyat: parseFloat(fiyatStr) || 0,
            indirimFiyat: null,
            indirimOrani: null,
            stokta: true,
            platformUrl: restoranUrl,
          };

          urunler.push(urun);
        } catch (e) {
          console.error('Ürün parse hatası:', e.message);
        }
      });

      console.log(`✅ Trendyol: ${urunler.length} ürün çekildi`);
      return urunler;
    } catch (hata) {
      console.error('❌ Trendyol menü scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }
}
