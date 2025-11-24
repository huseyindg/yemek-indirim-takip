import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { IndirimServisi } from './indirim.servis';
import { IndirimEntite } from './indirim.entite';

@Controller('indirimler')
export class IndirimDenetleyici {
  constructor(private readonly indirimServisi: IndirimServisi) {}

  @Get('aktif')
  async aktifIndirimleriGetir(): Promise<IndirimEntite[]> {
    return this.indirimServisi.aktifIndirimleriGetir();
  }

  @Get('platform/:platformId')
  async platformIndirimleri(
    @Param('platformId') platformId: string,
  ): Promise<IndirimEntite[]> {
    return this.indirimServisi.platformIndirimleri(platformId);
  }

  @Post()
  async indirimOlustur(
    @Body() veri: Partial<IndirimEntite>,
  ): Promise<IndirimEntite> {
    return this.indirimServisi.indirimOlustur(veri);
  }

  @Patch(':id/oy')
  async oyKullan(
    @Param('id') id: string,
    @Body('olumlu') olumlu: boolean,
  ): Promise<IndirimEntite> {
    return this.indirimServisi.oyKullan(id, olumlu);
  }
}
