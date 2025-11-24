import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { FiyatEntite } from './fiyat.entite';

@Injectable()
export class FiyatServisi {
  constructor(
    @InjectRepository(FiyatEntite)
    private fiyatRepository: Repository<FiyatEntite>,
  ) {}

  async fiyatKaydet(veri: {
    urunId: string;
    fiyat: number;
    indirimFiyat?: number;
    indirimOrani?: number;
  }): Promise<FiyatEntite> {
    // Son fiyatı al
    const sonFiyat = await this.fiyatRepository.findOne({
      where: { urunId: veri.urunId },
      order: { tarih: 'DESC' },
    });

    let degisiklik = false;
    let fiyatFarki = null;
    let degisimYuzdesi = null;

    if (sonFiyat) {
      const oncekiFiyat = sonFiyat.indirimFiyat || sonFiyat.fiyat;
      const yeniFiyat = veri.indirimFiyat || veri.fiyat;

      if (oncekiFiyat !== yeniFiyat) {
        degisiklik = true;
        fiyatFarki = yeniFiyat - oncekiFiyat;
        degisimYuzdesi = ((fiyatFarki / oncekiFiyat) * 100).toFixed(2);
      }
    }

    const yeniFiyat = this.fiyatRepository.create({
      ...veri,
      degisiklik,
      fiyatFarki,
      degisimYuzdesi,
      tur: veri.indirimFiyat ? 'indirim' : 'normal',
    });

    return this.fiyatRepository.save(yeniFiyat);
  }

  async urunFiyatGecmisi(
    urunId: string,
    gunSayisi: number = 30,
  ): Promise<FiyatEntite[]> {
    const baslangicTarihi = new Date();
    baslangicTarihi.setDate(baslangicTarihi.getDate() - gunSayisi);

    return this.fiyatRepository.find({
      where: {
        urunId,
        tarih: LessThan(baslangicTarihi),
      },
      order: { tarih: 'ASC' },
    });
  }

  async enDusukFiyat(urunId: string): Promise<FiyatEntite> {
    return this.fiyatRepository.findOne({
      where: { urunId },
      order: { fiyat: 'ASC' },
    });
  }

  async enYuksekFiyat(urunId: string): Promise<FiyatEntite> {
    return this.fiyatRepository.findOne({
      where: { urunId },
      order: { fiyat: 'DESC' },
    });
  }

  async fiyatIstatistikleri(urunId: string) {
    const fiyatlar = await this.urunFiyatGecmisi(urunId, 30);

    if (fiyatlar.length === 0) {
      return null;
    }

    const fiyatListesi = fiyatlar.map((f) => Number(f.fiyat));
    const toplam = fiyatListesi.reduce((a, b) => a + b, 0);
    const ortalama = toplam / fiyatListesi.length;
    const enDusuk = Math.min(...fiyatListesi);
    const enYuksek = Math.max(...fiyatListesi);

    return {
      ortalama: ortalama.toFixed(2),
      enDusuk,
      enYuksek,
      guncelFiyat: fiyatListesi[fiyatListesi.length - 1],
      veriSayisi: fiyatListesi.length,
    };
  }
}
