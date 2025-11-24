import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BrowserServisi } from '../browser.servis';
import { RateLimiterServisi } from '../rate-limiter.servis';
import { ProxyServisi } from '../proxy.servis';
import { UrunVerisi } from '../../../baglantilar/platform-baglanti.interface';

@Injectable()
export class MigrosScraper {
  private readonly platformKodu = 'migros';
  private readonly anaUrl = 'https://www.migroshemen.com';

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

      // Arama
      await this.browserServisi.rastgeleBekle(1000, 2000);
      await sayfa.waitForSelector('input[type="search"]', { timeout: 10000 });
      await sayfa.type('input[type="search"]', aramaMetni, { delay: 100 });
      await sayfa.keyboard.press('Enter');

      await sayfa.waitForSelector('.store-card', { timeout: 10000 });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const restoranlar = [];

      $('.store-card').each((index, element) => {
        try {
          const restoran = {
            id: $(element).attr('data-store-id'),
            ad: $(element).find('.store-name').text().trim(),
            puan: parseFloat($(element).find('.rating').text().trim()),
            minSiparis: parseFloat(
              $(element)
                .find('.min-order')
                .text()
                .replace(/[^0-9.]/g, ''),
            ),
            teslimatUcreti: 'Ücretsiz', // Migros genelde ücretsiz teslimat
            gorsel: $(element).find('img').attr('src'),
            url: `${this.anaUrl}${$(element).find('a').attr('href')}`,
          };

          restoranlar.push(restoran);
        } catch (e) {
          console.error('Parse hatası:', e.message);
        }
      });

      console.log(`✅ Migros: ${restoranlar.length} mağaza bulundu`);
      return restoranlar;
    } catch (hata) {
      console.error('❌ Migros scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  async urunleriCek(kategori: string = 'yemek'): Promise<UrunVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);
      await this.browserServisi.sayfayaGit(
        sayfa,
        `${this.anaUrl}/${kategori}`,
      );

      await sayfa.waitForSelector('.product-item', { timeout: 10000 });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const urunler: UrunVerisi[] = [];

      $('.product-item').each((index, element) => {
        try {
          const fiyatStr = $(element)
            .find('.product-price')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const indirimFiyatStr = $(element)
            .find('.discounted-price')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const guncelFiyat = parseFloat(fiyatStr) || 0;
          const indirimFiyat = indirimFiyatStr
            ? parseFloat(indirimFiyatStr)
            : null;

          const urun: UrunVerisi = {
            platformUrunId: $(element).attr('data-product-id') || `${index}`,
            ad: $(element).find('.product-name').text().trim(),
            aciklama: $(element).find('.product-description').text().trim(),
            gorsel: $(element).find('img').attr('src'),
            kategori: kategori,
            restoran: 'Migros Sanal Market',
            restoranId: 'migros-sm',
            guncelFiyat,
            indirimFiyat,
            indirimOrani: indirimFiyat
              ? Math.round(((guncelFiyat - indirimFiyat) / guncelFiyat) * 100)
              : null,
            stokta: !$(element).hasClass('out-of-stock'),
            platformUrl: `${this.anaUrl}/${kategori}`,
          };

          urunler.push(urun);
        } catch (e) {
          console.error('Ürün parse hatası:', e.message);
        }
      });

      console.log(`✅ Migros: ${urunler.length} ürün çekildi`);
      return urunler;
    } catch (hata) {
      console.error('❌ Migros ürün scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      throw hata;
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }
}
