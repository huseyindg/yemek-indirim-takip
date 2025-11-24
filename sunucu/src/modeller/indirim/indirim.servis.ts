import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndirimEntite } from './indirim.entite';

@Injectable()
export class IndirimServisi {
  constructor(
    @InjectRepository(IndirimEntite)
    private indirimRepository: Repository<IndirimEntite>,
  ) {}

  async aktifIndirimleriGetir(): Promise<IndirimEntite[]> {
    const simdi = new Date();
    return this.indirimRepository
      .createQueryBuilder('indirim')
      .leftJoinAndSelect('indirim.platform', 'platform')
      .where('indirim.aktif = :aktif', { aktif: true })
      .andWhere(
        '(indirim.baslangicTarihi IS NULL OR indirim.baslangicTarihi <= :simdi)',
        { simdi },
      )
      .andWhere(
        '(indirim.bitisTarihi IS NULL OR indirim.bitisTarihi >= :simdi)',
        { simdi },
      )
      .orderBy('indirim.olusturulmaTarihi', 'DESC')
      .getMany();
  }

  async platformIndirimleri(platformId: string): Promise<IndirimEntite[]> {
    return this.indirimRepository.find({
      where: { platformId, aktif: true },
      order: { olusturulmaTarihi: 'DESC' },
    });
  }

  async indirimOlustur(veri: Partial<IndirimEntite>): Promise<IndirimEntite> {
    const indirim = this.indirimRepository.create(veri);
    return this.indirimRepository.save(indirim);
  }

  async kullanimSayisiniArtir(id: string): Promise<void> {
    await this.indirimRepository.increment({ id }, 'kullanimSayisi', 1);
  }

  async oyKullan(id: string, olumlu: boolean): Promise<IndirimEntite> {
    if (olumlu) {
      await this.indirimRepository.increment({ id }, 'olumluOy', 1);
    } else {
      await this.indirimRepository.increment({ id }, 'olumsuzOy', 1);
    }
    return this.indirimRepository.findOne({ where: { id } });
  }
}
