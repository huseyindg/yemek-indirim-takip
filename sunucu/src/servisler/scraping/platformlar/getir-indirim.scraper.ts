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
export class GetirIndirimScraper {
  private readonly platformKodu = 'getir';
  private readonly anaUrl = 'https://getir.com';

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

      console.log(`📍 Getir - Bölge: ${sehir} / ${bolge}`);

      // Getir Yemek sayfasına git
      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/yemek`);

      // Konum modal'ını kapat
      await this.modalKapat(sayfa);

      // Kampanyalar/İndirimler sekmesine git
      try {
        await sayfa.waitForSelector('[data-testid="promotions-tab"], .promotions-section', {
          timeout: 5000,
        });
        await sayfa.click('[data-testid="promotions-tab"], .promotions-section');
        await this.browserServisi.rastgeleBekle(2000, 3000);
      } catch (e) {
        console.log('Kampanya sekmesi bulunamadı, ana sayfadan devam...');
      }

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // İndirim kartlarını bul
      $('[data-testid="promo-card"], .promotion-card, .campaign-card').each((index, element) => {
        try {
          const baslik = $(element).find('.promo-title, .campaign-title, h3').text().trim();
          const aciklama = $(element).find('.promo-description, p').text().trim();

          // Restoran adı
          const restoranAdi = $(element).find('.restaurant-name, .vendor-name').text().trim() ||
                              baslik.split('-')[0].trim() ||
                              'Getir Yemek';

          // Fiyat bilgisi
          const eskiFiyatStr = $(element)
            .find('.old-price, s, del')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          const yeniFiyatStr = $(element)
            .find('.new-price, .price')
            .text()
            .replace(/[^0-9.,]/g, '')
            .replace(',', '.');

          // İndirim oranı
          let indirimOrani = 0;
          const indirimBadge = $(element).find('.discount-badge, .badge').text();
          const oranMatch = indirimBadge.match(/(%|yüzde)\s*(\d+)/i);
          if (oranMatch) {
            indirimOrani = parseInt(oranMatch[2]);
          }

          const eskiFiyat = parseFloat(eskiFiyatStr) || 0;
          const yeniFiyat = parseFloat(yeniFiyatStr) || 0;

          // İndirim hesapla
          if (!indirimOrani && eskiFiyat > 0 && yeniFiyat > 0) {
            indirimOrani = Math.round(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100);
          }

          // Gerçek indirim varsa kaydet
          if (indirimOrani > 0 || (eskiFiyat > 0 && yeniFiyat > 0 && yeniFiyat < eskiFiyat)) {
            const indirim: IndirimVerisi = {
              id: `getir-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'getir',
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
              url: `${this.anaUrl}/yemek`,
              bulunmaTarihi: new Date(),
            };

            indirimler.push(indirim);
          }
        } catch (e) {
          console.error('Getir kampanya parse hatası:', e.message);
        }
      });

      console.log(`✅ Getir: ${indirimler.length} indirim bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Getir kampanya scraping hatası:', hata.message);
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

      // Getir ana sayfaya git
      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/yemek`);

      await this.modalKapat(sayfa);
      await this.browserServisi.rastgeleBekle(2000, 3000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const kodlar: IndirimKoduVerisi[] = [];

      // İndirim kodlarını ara
      $('[data-testid="promo-code"], .promo-code-card, .coupon').each((index, element) => {
        try {
          const kod = $(element).find('.code, .promo-code-text, code').text().trim();
          if (!kod) return;

          const baslik = $(element).find('.promo-title, h4').text().trim();
          const aciklama = $(element).find('.promo-desc, .description').text().trim();

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
          const yeniKullaniciIcin = /yeni|ilk\s*sipariş/i.test(tamMetin);

          const indirimKodu: IndirimKoduVerisi = {
            id: `getir-kod-${index}-${Date.now()}`,
            kod,
            platform: 'getir',
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
          console.error('Getir kod parse hatası:', e.message);
        }
      });

      console.log(`✅ Getir: ${kodlar.length} indirim kodu bulundu`);
      return kodlar;
    } catch (hata) {
      console.error('❌ Getir kod scraping hatası:', hata.message);
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

      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/yemek`);
      await this.modalKapat(sayfa);

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(2000, 3000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // Restoran kartlarında indirim rozeti olanları bul
      $('[data-testid="restaurant-card"], .restaurant-item').each((index, element) => {
        try {
          const indirimBadge = $(element).find('[data-testid="discount-badge"], .discount-label, .badge-discount');
          if (indirimBadge.length === 0) return;

          const restoranAdi = $(element).find('[data-testid="restaurant-name"], .restaurant-name').text().trim();
          if (!restoranAdi) return;

          // İndirim oranı
          const indirimMetni = indirimBadge.text();
          const oranMatch = indirimMetni.match(/(\d+)%/);
          const indirimOrani = oranMatch ? parseInt(oranMatch[1]) : 0;

          if (indirimOrani > 0) {
            const indirim: IndirimVerisi = {
              id: `getir-rest-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'getir',
              restoran: restoranAdi,
              restoranId: $(element).attr('data-restaurant-id') || `rest-${index}`,
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
          console.error('Getir restoran indirim parse hatası:', e.message);
        }
      });

      console.log(`✅ Getir: ${indirimler.length} indirimli restoran bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Getir restoran indirim scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  // Modal kapatma helper
  private async modalKapat(sayfa: Page): Promise<void> {
    try {
      await sayfa.waitForSelector('[data-testid="close-modal"], .modal-close, .close-button', {
        timeout: 3000,
      });
      await sayfa.click('[data-testid="close-modal"], .modal-close, .close-button');
      await this.browserServisi.rastgeleBekle(500, 1000);
    } catch (e) {
      // Modal yoksa devam
    }
  }
}
