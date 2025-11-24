import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UrunServisi } from './urun.servis';
import { UrunEntite } from './urun.entite';

@Controller('urunler')
export class UrunDenetleyici {
  constructor(private readonly urunServisi: UrunServisi) {}

  @Get()
  async tumUrunleriGetir(
    @Query('limit') limit?: number,
  ): Promise<UrunEntite[]> {
    return this.urunServisi.tumUrunleriGetir(limit);
  }

  @Get('ara')
  async urunAra(@Query('q') arama: string): Promise<UrunEntite[]> {
    return this.urunServisi.urunAra(arama);
  }

  @Get('platform/:platformId')
  async platformdakiUrunleriGetir(
    @Param('platformId') platformId: string,
  ): Promise<UrunEntite[]> {
    return this.urunServisi.platformdakiUrunleriGetir(platformId);
  }

  @Get(':id')
  async urunGetir(@Param('id') id: string): Promise<UrunEntite[]> {
    return this.urunServisi.urunGetir(id);
  }

  @Post()
  async urunOlustur(@Body() veri: Partial<UrunEntite>): Promise<UrunEntite> {
    return this.urunServisi.urunOlusturVeyaGuncelle(veri);
  }

  @Get(':id/sahte-indirim-kontrol')
  async sahteIndirimKontrol(@Param('id') id: string): Promise<boolean> {
    return this.urunServisi.sahteIndirimKontrol(id);
  }
}
