import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndirimEntite } from '../modeller/indirim/indirim.entite';
import { PlatformEntite } from '../modeller/platform/platform.entite';
import { YemeksepetiIndirimScraper } from './scraping/platformlar/yemeksepeti-indirim.scraper';
import { GetirIndirimScraper } from './scraping/platformlar/getir-indirim.scraper';
import { TrendyolIndirimScraper } from './scraping/platformlar/trendyol-indirim.scraper';
import { MigrosIndirimScraper } from './scraping/platformlar/migros-indirim.scraper';
import { BrowserServisi } from './scraping/browser.servis';
import { RateLimiterServisi } from './scraping/rate-limiter.servis';
import { ProxyServisi } from './scraping/proxy.servis';

export interface ScraperSonucu {
  platform: string;
  indirimSayisi: number;
  hata?: string;
}

@Injectable()
export class ScraperServisi {
  private readonly logger = new Logger(ScraperServisi.name);

  constructor(
    @InjectRepository(IndirimEntite)
    private indirimRepository: Repository<IndirimEntite>,
    @InjectRepository(PlatformEntite)
    private platformRepository: Repository<PlatformEntite>,
  ) {}

  async tumPlatformlariTara(bolge: string = 'kadikoy', sehir: string = 'istanbul'): Promise<ScraperSonucu[]> {
    this.logger.log(`Scraping baslatiliyor: ${sehir}/${bolge}`);
    const sonuclar: ScraperSonucu[] = [];

    // Initialize scraping services only when needed
    const proxyServisi = new ProxyServisi();
    const rateLimiterServisi = new RateLimiterServisi();
    const browserServisi = new BrowserServisi(proxyServisi);

    // Platformları yükle
    const platformlar = await this.platformRepository.find();
    const platformMap = new Map(platformlar.map(p => [p.kod, p.id]));

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

    // Yemeksepeti
    try {
      this.logger.log('🍕 Yemeksepeti taranıyor...');
      const indirimKodlari = await yemeksepetiScraper.indirimKodlariCek();
      const kayitSayisi = await this.indirimKodlariniKaydet(indirimKodlari, platformMap.get('yemeksepeti'));
      sonuclar.push({ platform: 'Yemeksepeti', indirimSayisi: kayitSayisi });
      this.logger.log(`✅ Yemeksepeti: ${kayitSayisi} indirim kaydedildi`);
    } catch (hata) {
      this.logger.error(`❌ Yemeksepeti hatası: ${hata.message}`);
      sonuclar.push({ platform: 'Yemeksepeti', indirimSayisi: 0, hata: hata.message });
    }

    // Getir
    try {
      this.logger.log('🛵 Getir taranıyor...');
      const indirimKodlari = await getirScraper.indirimKodlariCek();
      const kayitSayisi = await this.indirimKodlariniKaydet(indirimKodlari, platformMap.get('getir'));
      sonuclar.push({ platform: 'Getir', indirimSayisi: kayitSayisi });
      this.logger.log(`✅ Getir: ${kayitSayisi} indirim kaydedildi`);
    } catch (hata) {
      this.logger.error(`❌ Getir hatası: ${hata.message}`);
      sonuclar.push({ platform: 'Getir', indirimSayisi: 0, hata: hata.message });
    }

    // Trendyol
    try {
      this.logger.log('🛒 Trendyol taranıyor...');
      const indirimKodlari = await trendyolScraper.indirimKodlariCek();
      const kayitSayisi = await this.indirimKodlariniKaydet(indirimKodlari, platformMap.get('trendyol'));
      sonuclar.push({ platform: 'Trendyol', indirimSayisi: kayitSayisi });
      this.logger.log(`✅ Trendyol: ${kayitSayisi} indirim kaydedildi`);
    } catch (hata) {
      this.logger.error(`❌ Trendyol hatası: ${hata.message}`);
      sonuclar.push({ platform: 'Trendyol', indirimSayisi: 0, hata: hata.message });
    }

    // Migros
    try {
      this.logger.log('🏪 Migros taranıyor...');
      const indirimKodlari = await migrosScraper.indirimKodlariCek();
      const kayitSayisi = await this.indirimKodlariniKaydet(indirimKodlari, platformMap.get('migros'));
      sonuclar.push({ platform: 'Migros', indirimSayisi: kayitSayisi });
      this.logger.log(`✅ Migros: ${kayitSayisi} indirim kaydedildi`);
    } catch (hata) {
      this.logger.error(`❌ Migros hatası: ${hata.message}`);
      sonuclar.push({ platform: 'Migros', indirimSayisi: 0, hata: hata.message });
    }

    // Cleanup
    await browserServisi.tumTarayicilariKapat();

    this.logger.log('Scraping tamamlandi');
    return sonuclar;
  }

  private async indirimKodlariniKaydet(indirimKodlari: any[], platformId: string): Promise<number> {
    let kayitSayisi = 0;

    for (const kod of indirimKodlari) {
      try {
        // Aynı kodu kontrol et
        const mevcut = await this.indirimRepository.findOne({
          where: { kod: kod.kod, platformId },
        });

        if (mevcut) {
          // Güncelle
          mevcut.baslik = kod.baslik;
          mevcut.aciklama = kod.aciklama || '';
          mevcut.tur = kod.indirimTuru === 'yuzde' ? 'kod' : 'kampanya';
          if (kod.indirimTuru === 'yuzde') {
            mevcut.indirimOrani = kod.indirimMiktari;
            mevcut.indirimMiktari = null;
          } else {
            mevcut.indirimOrani = null;
            mevcut.indirimMiktari = kod.indirimMiktari;
          }
          mevcut.minimumSiparisTutari = kod.minimumSiparis || null;
          mevcut.maksimumIndirim = kod.maksimumIndirim || null;
          mevcut.yeniKullaniciIcin = kod.yeniKullaniciIcin || false;
          mevcut.aktif = kod.aktif !== false;
          if (kod.bitisTarihi) {
            mevcut.bitisTarihi = new Date(kod.bitisTarihi);
          }
          await this.indirimRepository.save(mevcut);
        } else {
          // Yeni kayıt oluştur
          const yeniIndirim = this.indirimRepository.create({
            platformId,
            kod: kod.kod,
            baslik: kod.baslik,
            aciklama: kod.aciklama || '',
            tur: kod.indirimTuru === 'yuzde' ? 'kod' : 'kampanya',
            indirimOrani: kod.indirimTuru === 'yuzde' ? kod.indirimMiktari : null,
            indirimMiktari: kod.indirimTuru === 'sabit' ? kod.indirimMiktari : null,
            minimumSiparisTutari: kod.minimumSiparis || null,
            maksimumIndirim: kod.maksimumIndirim || null,
            yeniKullaniciIcin: kod.yeniKullaniciIcin || false,
            baslangicTarihi: kod.baslangicTarihi ? new Date(kod.baslangicTarihi) : null,
            bitisTarihi: kod.bitisTarihi ? new Date(kod.bitisTarihi) : null,
            aktif: kod.aktif !== false,
            kullanimSayisi: 0,
            olumluOy: 0,
            olumsuzOy: 0,
          });

          await this.indirimRepository.save(yeniIndirim);
        }
        kayitSayisi++;
      } catch (hata) {
        this.logger.error(`Kayıt hatası: ${hata.message}`);
      }
    }

    return kayitSayisi;
  }
}
