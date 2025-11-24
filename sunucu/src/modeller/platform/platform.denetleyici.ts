import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { PlatformServisi } from './platform.servis';
import { PlatformEntite } from './platform.entite';

@Controller('platformlar')
export class PlatformDenetleyici {
  constructor(private readonly platformServisi: PlatformServisi) {}

  @Get()
  async tumPlatformlariGetir(): Promise<PlatformEntite[]> {
    return this.platformServisi.tumPlatformlariGetir();
  }

  @Get(':id')
  async platformGetir(@Param('id') id: string): Promise<PlatformEntite> {
    return this.platformServisi.platformGetir(id);
  }

  @Post()
  async platformOlustur(
    @Body() veri: Partial<PlatformEntite>,
  ): Promise<PlatformEntite> {
    return this.platformServisi.platformOlustur(veri);
  }

  @Patch(':id')
  async platformGuncelle(
    @Param('id') id: string,
    @Body() veri: Partial<PlatformEntite>,
  ): Promise<PlatformEntite> {
    return this.platformServisi.platformGuncelle(id, veri);
  }
}
