import { Controller, Post, Get, Query } from '@nestjs/common';
import { ScraperServisi } from './scraper.servis';

@Controller('scraper')
export class ScraperDenetleyici {
  constructor(private readonly scraperServisi: ScraperServisi) {}

  @Post('calistir')
  async scraperCalistir(
    @Query('bolge') bolge: string = 'kadikoy',
    @Query('sehir') sehir: string = 'istanbul',
  ) {
    const sonuclar = await this.scraperServisi.tumPlatformlariTara(bolge, sehir);

    const toplamIndirim = sonuclar.reduce((toplam, s) => toplam + s.indirimSayisi, 0);
    const hatalar = sonuclar.filter(s => s.hata);

    return {
      durum: 'tamamlandi',
      toplam_indirim: toplamIndirim,
      detaylar: sonuclar,
      hatalar: hatalar.length > 0 ? hatalar : undefined,
    };
  }

  @Get('durum')
  async scrapingDurumu() {
    return {
      durum: 'hazir',
      mesaj: 'Scraper çalıştırılmaya hazır. POST /scraper/calistir endpoint\'ini kullanın.',
    };
  }
}
