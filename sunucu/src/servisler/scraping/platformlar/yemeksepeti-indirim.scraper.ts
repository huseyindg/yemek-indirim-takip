import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BrowserServisi } from '../browser.servis';
import { RateLimiterServisi } from '../rate-limiter.servis';
import { ProxyServisi } from '../proxy.servis';

export interface IndirimVerisi {
  id: string;
  platform: string;

  // Restoran/Ürün bilgisi
  restoran: string;
  restoranId: string;
  urunAdi?: string;
  kategori?: string;
  gorsel?: string;

  // Fiyat bilgileri
  eskiFiyat: number;
  yeniFiyat: number;
  indirimOrani: number;

  // Lokasyon
  bolge: string;
  sehir: string;

  // Meta
  kampanyaBaslik?: string;
  kampanyaAciklama?: string;
  bitisTarihi?: string;
  url: string;

  // Zamanlama
  bulunmaTarihi: Date;
}

export interface IndirimKoduVerisi {
  id: string;
  kod: string;
  platform: string;

  baslik: string;
  aciklama?: string;

  // İndirim detayları
  indirimTuru: 'yuzde' | 'sabit';
  indirimMiktari: number;
  minimumSiparis?: number;
  maksimumIndirim?: number;

  // Şartlar
  yeniKullaniciIcin: boolean;
  sartlar?: string[];

  // Tarih
  baslangicTarihi?: Date;
  bitisTarihi?: Date;
  aktif: boolean;
}

@Injectable()
export class YemeksepetiIndirimScraper {
  private readonly platformKodu = 'yemeksepeti';
  private readonly anaUrl = 'https://www.yemeksepeti.com';

  constructor(
    private browserServisi: BrowserServisi,
    private rateLimiterServisi: RateLimiterServisi,
    private proxyServisi: ProxyServisi,
  ) {}

  /**
   * KAMPANYA SAYFASINI ÇEK
   * Ana hedef: Güncel kampanyaları ve indirimleri topla
   */
  async kampanyalariCek(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<IndirimVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      console.log(`📍 Bölge: ${sehir} / ${bolge}`);

      // Ana sayfaya git
      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);

      // Konum seç
      await this.konumSec(sayfa, sehir, bolge);

      // Kampanyalar sayfasına git
      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/kampanyalar`);

      await this.browserServisi.rastgeleBekle(2000, 3000);

      // Kampanyaları bekle
      await sayfa.waitForSelector('[data-testid="campaign-card"], .campaign-item, .promotion-card', {
        timeout: 10000,
      });

      await this.browserServisi.insanGibiKaydir(sayfa);
      await this.browserServisi.rastgeleBekle(1000, 2000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // Kampanya kartlarını parse et
      $('[data-testid="campaign-card"], .campaign-item, .promotion-card').each((index, element) => {
        try {
          const kampanyaBaslik = $(element).find('.campaign-title, h3, h4').first().text().trim();
          const aciklama = $(element).find('.campaign-description, .description, p').first().text().trim();

          // Fiyat bilgilerini çıkar
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

          // İndirim oranı
          let indirimOrani = 0;
          const indirimBadge = $(element).find('.discount-badge, .discount-percentage').text();
          const indirimMatch = indirimBadge.match(/(\d+)%/);
          if (indirimMatch) {
            indirimOrani = parseInt(indirimMatch[1]);
          }

          const eskiFiyat = parseFloat(eskiFiyatStr) || 0;
          const yeniFiyat = parseFloat(yeniFiyatStr) || 0;

          // İndirim oranı hesapla (eğer bulunamadıysa)
          if (!indirimOrani && eskiFiyat > 0 && yeniFiyat > 0) {
            indirimOrani = Math.round(((eskiFiyat - yeniFiyat) / eskiFiyat) * 100);
          }

          // Sadece gerçek indirimleri al
          if (eskiFiyat > 0 && yeniFiyat > 0 && yeniFiyat < eskiFiyat) {
            const restoranAdi = $(element).find('.restaurant-name, .vendor-name').text().trim() ||
                                kampanyaBaslik.split('-')[0].trim();

            const indirim: IndirimVerisi = {
              id: `ys-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'yemeksepeti',
              restoran: restoranAdi,
              restoranId: $(element).attr('data-restaurant-id') || `unknown-${index}`,
              urunAdi: kampanyaBaslik,
              gorsel: $(element).find('img').attr('src') || $(element).find('img').attr('data-src'),
              eskiFiyat,
              yeniFiyat,
              indirimOrani,
              bolge,
              sehir,
              kampanyaBaslik,
              kampanyaAciklama: aciklama,
              url: `${this.anaUrl}${$(element).find('a').attr('href')}` || `${this.anaUrl}/kampanyalar`,
              bulunmaTarihi: new Date(),
            };

            indirimler.push(indirim);
          }
        } catch (e) {
          console.error('Kampanya parse hatası:', e.message);
        }
      });

      console.log(`✅ Yemeksepeti: ${indirimler.length} indirim bulundu`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Yemeksepeti kampanya scraping hatası:', hata.message);
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

      // Kampanyalar/kuponlar sayfasına git
      await this.browserServisi.sayfayaGit(sayfa, `${this.anaUrl}/kampanyalar`);
      await this.browserServisi.rastgeleBekle(2000, 3000);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const kodlar: IndirimKoduVerisi[] = [];

      // İndirim kodlarını ara
      $('[data-testid="coupon-code"], .coupon-card, .promo-code').each((index, element) => {
        try {
          const kod = $(element).find('.code-text, .coupon-code, code').text().trim();
          if (!kod) return;

          const baslik = $(element).find('.coupon-title, h3, h4').text().trim();
          const aciklama = $(element).find('.coupon-description, .description').text().trim();

          // İndirim miktarını çıkar
          let indirimMiktari = 0;
          let indirimTuru: 'yuzde' | 'sabit' = 'yuzde';

          const indirimMetni = baslik + ' ' + aciklama;

          // %X indirim
          const yuzdeMatch = indirimMetni.match(/(%|yüzde)\s*(\d+)/i);
          if (yuzdeMatch) {
            indirimMiktari = parseInt(yuzdeMatch[2]);
            indirimTuru = 'yuzde';
          }

          // X₺ indirim
          const tlMatch = indirimMetni.match(/(\d+)\s*(₺|TL)/i);
          if (tlMatch && !yuzdeMatch) {
            indirimMiktari = parseInt(tlMatch[1]);
            indirimTuru = 'sabit';
          }

          // Minimum sipariş
          let minimumSiparis: number | undefined;
          const minMatch = indirimMetni.match(/minimum\s*(\d+)\s*(₺|TL)/i);
          if (minMatch) {
            minimumSiparis = parseInt(minMatch[1]);
          }

          // Yeni kullanıcı kontrolü
          const yeniKullaniciIcin = /yeni.*kullanıcı|ilk.*sipariş/i.test(indirimMetni);

          // Bitiş tarihi
          const tarihMetni = $(element).find('.expiry-date, .valid-until').text();
          let bitisTarihi: Date | undefined;
          const tarihMatch = tarihMetni.match(/(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})/);
          if (tarihMatch) {
            const [, gun, ay, yil] = tarihMatch;
            bitisTarihi = new Date(parseInt(yil), parseInt(ay) - 1, parseInt(gun));
          }

          const indirimKodu: IndirimKoduVerisi = {
            id: `ys-kod-${index}-${Date.now()}`,
            kod,
            platform: 'yemeksepeti',
            baslik: baslik || `${indirimMiktari}${indirimTuru === 'yuzde' ? '%' : '₺'} İndirim`,
            aciklama,
            indirimTuru,
            indirimMiktari,
            minimumSiparis,
            yeniKullaniciIcin,
            bitisTarihi,
            aktif: true,
          };

          kodlar.push(indirimKodu);
        } catch (e) {
          console.error('İndirim kodu parse hatası:', e.message);
        }
      });

      console.log(`✅ Yemeksepeti: ${kodlar.length} indirim kodu bulundu`);
      return kodlar;
    } catch (hata) {
      console.error('❌ Yemeksepeti kod scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  /**
   * İNDİRİMLİ RESTORANLAR (Bölge bazlı)
   */
  async indirimliRestoranlar(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<IndirimVerisi[]> {
    await this.rateLimiterServisi.istekOncesiBekle(this.platformKodu);

    const proxy = this.proxyServisi.rastgeleProxy();
    const tarayici = await this.browserServisi.tarayiciyiBaslat(proxy);

    try {
      const sayfa = await this.browserServisi.yeniSayfaOlustur(tarayici);

      // Ana sayfaya git
      await this.browserServisi.sayfayaGit(sayfa, this.anaUrl);

      // Konum seç
      await this.konumSec(sayfa, sehir, bolge);

      await this.browserServisi.rastgeleBekle(2000, 3000);

      // "İndirimli" filtresi varsa tıkla
      try {
        await sayfa.waitForSelector('[data-testid="filter-discount"], .filter-discounted', {
          timeout: 3000,
        });
        await sayfa.click('[data-testid="filter-discount"], .filter-discounted');
        await this.browserServisi.rastgeleBekle(1000, 2000);
      } catch (e) {
        console.log('İndirim filtresi bulunamadı, devam ediliyor...');
      }

      await this.browserServisi.insanGibiKaydir(sayfa);

      const html = await sayfa.content();
      const $ = cheerio.load(html);

      const indirimler: IndirimVerisi[] = [];

      // İndirimli restoranları bul
      $('.restaurant-card, [data-testid="restaurant-card"]').each((index, element) => {
        try {
          // Sadece indirim rozeti olanları al
          const indirimBadge = $(element).find('.discount-badge, .badge-discount, [data-testid="discount-badge"]');
          if (indirimBadge.length === 0) return;

          const restoranAdi = $(element).find('.restaurant-name, [data-testid="restaurant-name"]').text().trim();
          if (!restoranAdi) return;

          // İndirim oranını çıkar
          const indirimMetni = indirimBadge.text();
          const indirimMatch = indirimMetni.match(/(\d+)%/);
          const indirimOrani = indirimMatch ? parseInt(indirimMatch[1]) : 0;

          if (indirimOrani > 0) {
            const indirim: IndirimVerisi = {
              id: `ys-rest-${sehir}-${bolge}-${index}-${Date.now()}`,
              platform: 'yemeksepeti',
              restoran: restoranAdi,
              restoranId: $(element).attr('data-restaurant-id') || `rest-${index}`,
              gorsel: $(element).find('img').attr('src') || $(element).find('img').attr('data-src'),
              eskiFiyat: 0, // Restoran geneli indirim olduğu için eski fiyat yok
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
          console.error('Restoran indirim parse hatası:', e.message);
        }
      });

      console.log(`✅ Yemeksepeti: ${indirimler.length} indirimli restoran bulundu (${bolge})`);
      return indirimler;
    } catch (hata) {
      console.error('❌ Yemeksepeti restoran indirim scraping hatası:', hata.message);
      if (proxy) {
        this.proxyServisi.proxyBasarisizOldu(proxy);
      }
      return [];
    } finally {
      await this.browserServisi.tarayiciyiKapat(tarayici);
    }
  }

  // Konum seçimi helper
  private async konumSec(sayfa: Page, sehir: string, bolge: string): Promise<void> {
    try {
      // Konum modal'ını aç
      await sayfa.waitForSelector('[data-testid="location-button"], .location-selector', {
        timeout: 5000,
      });
      await sayfa.click('[data-testid="location-button"], .location-selector');

      await this.browserServisi.rastgeleBekle(1000, 2000);

      // Şehir seçimi (örn: istanbul)
      await sayfa.waitForSelector(`[data-city="${sehir}"], .city-option`, { timeout: 5000 });
      await sayfa.click(`[data-city="${sehir}"], .city-option`);

      await this.browserServisi.rastgeleBekle(500, 1000);

      // Semt seçimi (örn: kadikoy)
      await sayfa.waitForSelector(`[data-district="${bolge}"], .district-option`, {
        timeout: 5000,
      });
      await sayfa.click(`[data-district="${bolge}"], .district-option`);

      console.log(`✅ Konum seçildi: ${sehir} / ${bolge}`);
    } catch (e) {
      console.warn(`⚠️  Konum seçimi başarısız: ${e.message}`);
    }
  }
}
