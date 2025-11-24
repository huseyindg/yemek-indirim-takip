import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BrowserServisi } from '../browser.servis';
import { RateLimiterServisi } from '../rate-limiter.servis';
import { ProxyServisi } from '../proxy.servis';

export interface IndirimVerisi {
  id: string;
  platform: string;
  restoran: string;
  restoranId: string;
  urunAdi?: string;
  kategori?: string;
  gorsel?: string;
  eskiFiyat: number;
  yeniFiyat: number;
  indirimOrani: number;
  bolge: string;
  sehir: string;
  kampanyaBaslik?: string;
  kampanyaAciklama?: string;
  bitisTarihi?: string;
  url: string;
  bulunmaTarihi: Date;
}

export interface IndirimKoduVerisi {
  id: string;
  kod: string;
  platform: string;
  baslik: string;
  aciklama?: string;
  indirimTuru: 'yuzde' | 'sabit';
  indirimMiktari: number;
  minimumSiparis?: number;
  maksimumIndirim?: number;
  yeniKullaniciIcin: boolean;
  sartlar?: string[];
  baslangicTarihi?: Date;
  bitisTarihi?: Date;
  aktif: boolean;
}

@Injectable()
export class TrendyolIndirimScraper {
  private readonly platformKodu = 'trendyol';
  private readonly anaUrl = 'https://www.trendyolyemek.com';

  constructor(
    private browserServisi: BrowserServisi,
    private rateLimiterServisi: RateLimiterServisi,
    private proxyServisi: ProxyServisi,
  ) {}

  /**
   * KAMPANYA/İNDİRİMLERİ ÇEK
   */
  async kampanyalariCek(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<IndirimVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      console.log(`📍 Trendyol Yemek - Bölge: ${sehir} / ${bolge}`);

      // Ana sayfaya git
      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);

      // Kampanyalar/İndirimler bölümüne git
      try {
        await sayfa.waitForSelector('[data-testid="campaigns"], .campaigns-section, .deals', {
          timeout: 5000,
        });
        await sayfa.click('[data-testid="campaigns"], .campaigns-section, .deals');
        await this.browserServisi.rastgeleBekle(2000, 3000);
      } catch (e) {
        console.log('Kampanya bölümü bulunamadı...');
      }

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // Kampanya kartlarını parse et
      $('.campaign-card, [data-testid="promotion-card"], .deal-item').each((index, element) => {
        try {
          const baslik = $(element).find('.campaign-title, .deal-title, h3').text().trim();
          const aciklama = $(element).find('.campaign-desc, .description').text().trim();

          const restoranAdi = $(element).find('.restaurant-name, .vendor').text().trim() ||
                              baslik.split(/[-–]/)[0].trim() ||
                              'Trendyol Yemek';

          // Fiyat bilgisi
          const eskiFiyatStr = $(element)
            .find('.old-price, .original, s')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const yeniFiyatStr = $(element)
            .find('.new-price, .discounted, .price')
            .first()
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          // İndirim oranı
          let indirimOrani = 0;
          const badge = $(element).find('.discount-badge, .percentage').text();
          const oranMatch = badge.match(/(%|yüzde)?\s*(\d+)/i);
          if (oranMatch) {
            indirimOrani = parseInt(oranMatch[2]);
          }

          const eskiFiyat = parseFloat(eskiFiyatStr) || 0;
          const yeniFiyat = parseFloat(yeniFiyatStr) || 0;

          if (!indirimOrani && eskiFiyat > 0 && yeniFiyat > 0) {
            indirimOrani = Math.round(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100);
          }

          if (indirimOrani > 0 || (eskiFiyat > yeniFiyat && yeniFiyat > 0)) {
            const indirim: IndirimVerisi = {
              id: `trendyol-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'trendyol',
              restoran: restoranAdi,
              restoranId: $(element).attr('data-restaurant-id') || `rest-${index}`,
              urunAdi: baslik,
              gorsel: $(element).find('img').attr('src'),
              eskiFiyat,
              yeniFiyat,
              indirimOrani: indirimOrani || Math.round(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100),
              bolge,
              sehir,
              kampanyaBaslik: baslik,
              kampanyaAciklama: aciklama,
              url: `${this.anaUrl}${$(element).find('a').attr('href')}` || this.anaUrl,
              bulunmaTarihi: new Date(),
            };

            indirimler.push(indirim);
          }
        } catch (e) {
          console.error('Trendyol kampanya parse hatası:', e.message);
        }
      });

      console.log(`✅ Trendyol: ${indirimler.length} indirim bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Trendyol kampanya scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  /**
   * İNDİRİM KODLARINI ÇEK
   */
  async indirimKodlariCek(): Promise<IndirimKoduVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);
      await this.browserServisi.rastgeleBekle(2000, 3000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const kodlar: IndirimKoduVerisi[] = [];

      // İndirim kodlarını ara
      $('.coupon-card, [data-testid="promo-code"], .voucher').each((index, element) => {
        try {
          const kod = $(element).find('.code-text, .voucher-code, code').text().trim();
          if (!kod) return;

          const baslik = $(element).find('.coupon-title, h4').text().trim();
          const aciklama = $(element).find('.coupon-desc, .terms').text().trim();

          const tamMetin = baslik + ' ' + aciklama;

          // İndirim miktarı parse
          let indirimMiktari = 0;
          let indirimTuru: 'yuzde' | 'sabit' = 'yuzde';

          const yuzdeMatch = tamMetin.match(/(%|yüzde)\s*(\d+)/i);
          if (yuzdeMatch) {
            indirimMiktari = parseInt(yuzdeMatch[2]);
            indirimTuru = 'yuzde';
          }

          const tlMatch = tamMetin.match(/(\d+)\s*(₺|TL|tl)/i);
          if (tlMatch && !yuzdeMatch) {
            indirimMiktari = parseInt(tlMatch[1]);
            indirimTuru = 'sabit';
          }

          // Minimum sipariş
          let minimumSiparis: number | undefined;
          const minMatch = tamMetin.match(/min(?:imum)?\s*(\d+)/i);
          if (minMatch) {
            minimumSiparis = parseInt(minMatch[1]);
          }

          // Yeni kullanıcı kontrolü
          const yeniKullaniciIcin = /yeni.*kullanıcı|ilk.*sipariş/i.test(tamMetin);

          const indirimKodu: IndirimKoduVerisi = {
            id: `trendyol-kod-${index}-${Date.now()}`,
            kod,
            platform: 'trendyol',
            baslik: baslik || `${indirimMiktari}${indirimTuru === 'yuzde' ? '%' : '₺'} İndirim`,
            aciklama,
            indirimTuru,
            indirimMiktari,
            minimumSiparis,
            yeniKullaniciIcin,
            aktif: true,
          };

          kodlar.push(indirimKodu);
        } catch (e) {
          console.error('Trendyol kod parse hatası:', e.message);
        }
      });

      console.log(`✅ Trendyol: ${kodlar.length} indirim kodu bulundu`);
      return kodlar;
    } catch (hata) {
      console.error('❌ Trendyol kod scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  /**
   * İNDİRİMLİ RESTORANLAR
   */
  async indirimliRestoranlar(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<IndirimVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);
      await this.browserServisi.rastgeleBekle(2000, 3000);
      await this.browserServisi.insanGibiKaydir(sayfa);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // Restoran kartlarında indirim rozeti olanları bul
      $('.restaurant-card, [data-testid="restaurant-item"]').each((index, element) => {
        try {
          const indirimBadge = $(element).find('.discount-label, .promo-badge, [data-testid="discount"]');
          if (indirimBadge.length === 0) return;

          const restoranAdi = $(element).find('.restaurant-name, .name').text().trim();
          if (!restoranAdi) return;

          const indirimMetni = indirimBadge.text();
          const oranMatch = indirimMetni.match(/(\d+)%/);
          const indirimOrani = oranMatch ? parseInt(oranMatch[1]) : 0;

          if (indirimOrani > 0) {
            const indirim: IndirimVerisi = {
              id: `trendyol-rest-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'trendyol',
              restoran: restoranAdi,
              restoranId: $(element).attr('data-id') || `rest-${index}`,
              gorsel: $(element).find('img').attr('src'),
              eskiFiyat: 0,
              yeniFiyat: 0,
              indirimOrani,
              bolge,
              sehir,
              kampanyaBaslik: `${restoranAdi} - %${indirimOrani} İndirim`,
              url: `${this.anaUrl}${$(element).find('a').attr('href')}`,
              bulunmaTarihi: new Date(),
            };

            indirimler.push(indirim);
          }
        } catch (e) {
          console.error('Trendyol restoran indirim parse hatası:', e.message);
        }
      });

      console.log(`✅ Trendyol: ${indirimler.length} indirimli restoran bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Trendyol restoran indirim scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }
}
