import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformEntite } from './platform.entite';

@Injectable()
export class PlatformServisi {
  constructor(
    @InjectRepository(PlatformEntite)
    private platformRepository: Repository<PlatformEntite>,
  ) {}

  async tumPlatformlariGetir(): Promise<PlatformEntite[]> {
    return this.platformRepository.find({
      where: { aktif: true },
      order: { ad: 'ASC' },
    });
  }

  async platformGetir(id: string): Promise<PlatformEntite> {
    return this.platformRepository.findOne({ where: { id } });
  }

  async platformKodaGoreGetir(kod: string): Promise<PlatformEntite> {
    return this.platformRepository.findOne({ where: { kod } });
  }

  async platformOlustur(
    veri: Partial<PlatformEntite>,
  ): Promise<PlatformEntite> {
    const platform = this.platformRepository.create(veri);
    return this.platformRepository.save(platform);
  }

  async platformGuncelle(
    id: string,
    veri: Partial<PlatformEntite>,
  ): Promise<PlatformEntite> {
    await this.platformRepository.update(id, veri);
    return this.platformGetir(id);
  }

  async istemSayisiniArtir(platformId: string): Promise<void> {
    await this.platformRepository.increment(
      { id: platformId },
      'gunlukIstemSayisi',
      1,
    );
  }

  async gunlukIstemSayisiniSifirla(): Promise<void> {
    await this.platformRepository.update({}, { gunlukIstemSayisi: 0 });
  }

  async platformAktifMi(platformId: string): Promise<boolean> {
    const platform = await this.platformGetir(platformId);
    if (!platform || !platform.aktif) {
      return false;
    }
    return platform.gunlukIstemSayisi < platform.maksimumGunlukIstem;
  }
}
