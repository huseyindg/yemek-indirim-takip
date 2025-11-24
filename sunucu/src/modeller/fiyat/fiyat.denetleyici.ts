import { Controller, Get, Param } from '@nestjs/common';
import { FiyatServisi } from './fiyat.servis';

@Controller('fiyatlar')
export class FiyatDenetleyici {
  constructor(private readonly fiyatServisi: FiyatServisi) {}

  @Get('urun/:urunId/gecmis')
  async urunFiyatGecmisi(@Param('urunId') urunId: string) {
    return this.fiyatServisi.urunFiyatGecmisi(urunId, 30);
  }

  @Get('urun/:urunId/istatistikler')
  async fiyatIstatistikleri(@Param('urunId') urunId: string) {
    return this.fiyatServisi.fiyatIstatistikleri(urunId);
  }
}
