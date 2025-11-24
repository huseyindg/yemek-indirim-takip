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
export class MigrosIndirimScraper {
  private readonly platformKodu = 'migros';
  private readonly anaUrl = 'https://www.migroshemen.com';

  constructor(
    private browserServisi: BrowserServisi,
    private rateLimiterServisi: RateLimiterServisi,
    private proxyServisi: ProxyServisi,
  ) {}

  /**
   * KAMPANYA/İNDİRİMLERİ ÇEK
   * Migros'ta genelde ürün bazlı indirimler oluyor
   */
  async kampanyalariCek(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<IndirimVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      console.log(`📍 Migros - Bölge: ${sehir} / ${bolge}`);

      // Kampanyalar/Fırsatlar sayfasına git
      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/firsatlar`);
      await this.browserServisi.rastgeleBekle(2000, 3000);

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // İndirimli ürün kartlarını parse et
      $('.product-card, .campaign-item, [data-testid="product"]').each((index, element) => {
        try {
          const urunAdi = $(element).find('.product-name, .title, h3').text().trim();
          if (!urunAdi) return;

          // Fiyat bilgisi
          const eskiFiyatStr = $(element)
            .find('.old-price, .original-price, s, del')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const yeniFiyatStr = $(element)
            .find('.new-price, .discounted-price, .price')
            .first()
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          // İndirim rozeti
          let indirimOrani = 0;
          const badge = $(element).find('.discount-badge, .promo-badge').text();
          const oranMatch = badge.match(/(%|yüzde)?\s*(\d+)/i);
          if (oranMatch) {
            indirimOrani = parseInt(oranMatch[2]);
          }

          const eskiFiyat = parseFloat(eskiFiyatStr) || 0;
          const yeniFiyat = parseFloat(yeniFiyatStr) || 0;

          // İndirim hesapla
          if (!indirimOrani && eskiFiyat > 0 && yeniFiyat > 0) {
            indirimOrani = Math.round(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100);
          }

          if (indirimOrani > 0 || (eskiFiyat > yeniFiyat && yeniFiyat > 0)) {
            const kategori = $(element).find('.category, .breadcrumb').text().trim() || 'Yemek';

            const indirim: IndirimVerisi = {
              id: `migros-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'migros',
              restoran: 'Migros',
              restoranId: 'migros-hemen',
              urunAdi,
              kategori,
              gorsel: $(element).find('img').attr('src') || $(element).find('img').attr('data-src'),
              eskiFiyat,
              yeniFiyat,
              indirimOrani: indirimOrani || Math.round(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100),
              bolge,
              sehir,
              kampanyaBaslik: `${urunAdi} - %${indirimOrani} İndirim`,
              url: `${this.anaUrl}${$(element).find('a').attr('href')}` || `${this.anaUrl}/firsatlar`,
              bulunmaTarihi: new Date(),
            };

            indirimler.push(indirim);
          }
        } catch (e) {
          console.error('Migros kampanya parse hatası:', e.message);
        }
      });

      console.log(`✅ Migros: ${indirimler.length} indirim bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Migros kampanya scraping hatası:', hata.message);
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

      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/kampanyalar`);
      await this.browserServisi.rastgeleBekle(2000, 3000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const kodlar: IndirimKoduVerisi[] = [];

      // İndirim kodlarını ara
      $('.coupon, .promo-code-card, [data-testid="voucher"]').each((index, element) => {
        try {
          const kod = $(element).find('.code, .coupon-code, code').text().trim();
          if (!kod) return;

          const baslik = $(element).find('.coupon-title, .title, h4').text().trim();
          const aciklama = $(element).find('.description, .terms').text().trim();

          const tamMetin = baslik + ' ' + aciklama;

          // İndirim miktarı
          let indirimMiktari = 0;
          let indirimTuru: 'yuzde' | 'sabit' = 'yuzde';

          const yuzdeMatch = tamMetin.match(/(%|yüzde)\s*(\d+)/i);
          if (yuzdeMatch) {
            indirimMiktari = parseInt(yuzdeMatch[2]);
            indirimTuru = 'yuzde';
          }

          const tlMatch = tamMetin.match(/(\d+)\s*(₺|TL)/i);
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

          // Yeni kullanıcı
          const yeniKullaniciIcin = /yeni|ilk/i.test(tamMetin);

          const indirimKodu: IndirimKoduVerisi = {
            id: `migros-kod-${index}-${Date.now()}`,
            kod,
            platform: 'migros',
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
          console.error('Migros kod parse hatası:', e.message);
        }
      });

      console.log(`✅ Migros: ${kodlar.length} indirim kodu bulundu`);
      return kodlar;
    } catch (hata) {
      console.error('❌ Migros kod scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  /**
   * İNDİRİMLİ ÜRÜNLER (Ana sayfa)
   */
  async indirimliUrunler(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<IndirimVerisi[]> {
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

      // Ana sayfadaki indirimli ürünleri bul
      $('.product-item, [data-testid="product-card"]').each((index, element) => {
        try {
          const indirimBadge = $(element).find('.badge-discount, .promo-label');
          if (indirimBadge.length === 0) return;

          const urunAdi = $(element).find('.product-name, .name').text().trim();
          if (!urunAdi) return;

          const indirimMetni = indirimBadge.text();
          const oranMatch = indirimMetni.match(/(\d+)%/);
          const indirimOrani = oranMatch ? parseInt(oranMatch[1]) : 0;

          if (indirimOrani > 0) {
            const indirim: IndirimVerisi = {
              id: `migros-prod-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'migros',
              restoran: 'Migros',
              restoranId: 'migros-hemen',
              urunAdi,
              gorsel: $(element).find('img').attr('src'),
              eskiFiyat: 0,
              yeniFiyat: 0,
              indirimOrani,
              bolge,
              sehir,
              kampanyaBaslik: `${urunAdi} - %${indirimOrani} İndirim`,
              url: this.anaUrl,
              bulunmaTarihi: new Date(),
            };

            indirimler.push(indirim);
          }
        } catch (e) {
          console.error('Migros ürün indirim parse hatası:', e.message);
        }
      });

      console.log(`✅ Migros: ${indirimler.length} indirimli ürün bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Migros ürün indirim scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }
}
