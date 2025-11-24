import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrunEntite } from './urun.entite';
import { FiyatServisi } from '../fiyat/fiyat.servis';

@Injectable()
export class UrunServisi {
  constructor(
    @InjectRepository(UrunEntite)
    private urunRepository: Repository<UrunEntite>,
    private fiyatServisi: FiyatServisi,
  ) {}

  async tumUrunleriGetir(limit: number = 100): Promise<UrunEntite[]> {
    return this.urunRepository.find({
      take: limit,
      order: { guncellenmeTarihi: 'DESC' },
      relations: ['platform'],
    });
  }

  async urunGetir(id: string): Promise<UrunEntite> {
    return this.urunRepository.findOne({
      where: { id },
      relations: ['platform', 'fiyatGecmisi'],
    });
  }

  async platformdakiUrunleriGetir(platformId: string): Promise<UrunEntite[]> {
    return this.urunRepository.find({
      where: { platformId },
      relations: ['platform'],
      order: { ad: 'ASC' },
    });
  }

  async urunAra(arama: string): Promise<UrunEntite[]> {
    return this.urunRepository
      .createQueryBuilder('urun')
      .leftJoinAndSelect('urun.platform', 'platform')
      .where('LOWER(urun.ad) LIKE LOWER(:arama)', {
        arama: `%${arama}%`,
      })
      .orWhere('LOWER(urun.restoran) LIKE LOWER(:arama)', {
        arama: `%${arama}%`,
      })
      .take(50)
      .getMany();
  }

  async urunOlusturVeyaGuncelle(
    veri: Partial<UrunEntite>,
  ): Promise<UrunEntite> {
    // Aynı platform ve platformUrunId ile ürün var mı kontrol et
    const mevcutUrun = await this.urunRepository.findOne({
      where: {
        platformId: veri.platformId,
        platformUrunId: veri.platformUrunId,
      },
    });

    if (mevcutUrun) {
      // Fiyat değişikliği varsa fiyat geçmişine kaydet
      if (
        mevcutUrun.guncelFiyat !== veri.guncelFiyat ||
        mevcutUrun.indirimFiyat !== veri.indirimFiyat
      ) {
        await this.fiyatServisi.fiyatKaydet({
          urunId: mevcutUrun.id,
          fiyat: veri.guncelFiyat,
          indirimFiyat: veri.indirimFiyat,
          indirimOrani: veri.indirimOrani,
        });
      }

      // Ürünü güncelle
      await this.urunRepository.update(mevcutUrun.id, {
        ...veri,
        sonKontrolTarihi: new Date(),
      });

      return this.urunGetir(mevcutUrun.id);
    }

    // Yeni ürün oluştur
    const yeniUrun = this.urunRepository.create({
      ...veri,
      sonKontrolTarihi: new Date(),
    });
    const kaydedilmis = await this.urunRepository.save(yeniUrun);

    // İlk fiyatı kaydet
    await this.fiyatServisi.fiyatKaydet({
      urunId: kaydedilmis.id,
      fiyat: veri.guncelFiyat,
      indirimFiyat: veri.indirimFiyat,
      indirimOrani: veri.indirimOrani,
    });

    return kaydedilmis;
  }

  async sahteIndirimKontrol(urunId: string): Promise<boolean> {
    const urun = await this.urunGetir(urunId);
    if (!urun || !urun.indirimFiyat) {
      return false;
    }

    // Son 30 günlük fiyat geçmişini kontrol et
    const fiyatGecmisi = await this.fiyatServisi.urunFiyatGecmisi(
      urunId,
      30,
    );

    if (fiyatGecmisi.length < 3) {
      return false; // Yeterli veri yok
    }

    // Ortalama fiyatı hesapla
    const ortalama =
      fiyatGecmisi.reduce((toplam, f) => toplam + Number(f.fiyat), 0) /
      fiyatGecmisi.length;

    // İndirimli fiyat, ortalama fiyattan yüksekse sahte indirim olabilir
    const sahteIndirim = Number(urun.indirimFiyat) >= ortalama * 0.95;

    if (sahteIndirim) {
      await this.urunRepository.update(urunId, {
        sahteIndirim: true,
        sahteIndirimAciklama: `İndirimli fiyat (${urun.indirimFiyat}₺), son 30 günlük ortalama fiyata (${ortalama.toFixed(2)}₺) yakın veya daha yüksek.`,
      });
    }

    return sahteIndirim;
  }
}
