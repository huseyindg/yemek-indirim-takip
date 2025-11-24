import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  PlatformBaglanti,
  UrunVerisi,
  IndirimVerisi,
  RestoranVerisi,
  Konum,
} from '../platform-baglanti.interface';

@Injectable()
export class YemeksepetiB

aglanti implements PlatformBaglanti {
  private apiIstemcisi: AxiosInstance;
  private apiAnahtari: string;
  private apiUrl: string = 'https://integration.yemeksepeti.com';

  constructor() {
    this.apiAnahtari = process.env.YEMEKSEPETI_API_ANAHTARI || '';
    this.apiIstemcisi = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiAnahtari}`,
      },
      timeout: 10000,
    });
  }

  platformAdi(): string {
    return 'Yemeksepeti';
  }

  platformKodu(): string {
    return 'yemeksepeti';
  }

  async baglantiTesti(): Promise<boolean> {
    try {
      // API sağlık kontrolü
      const yanit = await this.apiIstemcisi.get('/health');
      return yanit.status === 200;
    } catch (hata) {
      console.error('Yemeksepeti bağlantı hatası:', hata.message);
      return false;
    }
  }

  async urunleriCek(parametreler?: any): Promise<UrunVerisi[]> {
    try {
      // NOT: Gerçek API endpoint'i dokümantasyondan alınmalı
      const yanit = await this.apiIstemcisi.get('/api/v1/products', {
        params: parametreler,
      });

      return this.urunVerisiniDonustur(yanit.data);
    } catch (hata) {
      console.error('Yemeksepeti ürün çekme hatası:', hata.message);
      return [];
    }
  }

  async urunDetayiCek(urunId: string): Promise<UrunVerisi> {
    try {
      const yanit = await this.apiIstemcisi.get(`/api/v1/products/${urunId}`);
      const [urun] = this.urunVerisiniDonustur([yanit.data]);
      return urun;
    } catch (hata) {
      console.error('Yemeksepeti ürün detay hatası:', hata.message);
      throw hata;
    }
  }

  async indirimleriCek(): Promise<IndirimVerisi[]> {
    try {
      // NOT: Gerçek API endpoint'i dokümantasyondan alınmalı
      const yanit = await this.apiIstemcisi.get('/api/v1/campaigns');

      return this.indirimVerisiniDonustur(yanit.data);
    } catch (hata) {
      console.error('Yemeksepeti indirim çekme hatası:', hata.message);
      return [];
    }
  }

  async restoranAra(arama: string, konum?: Konum): Promise<RestoranVerisi[]> {
    try {
      const yanit = await this.apiIstemcisi.get('/api/v1/restaurants/search', {
        params: {
          query: arama,
          latitude: konum?.enlem,
          longitude: konum?.boylam,
        },
      });

      return this.restoranVerisiniDonustur(yanit.data);
    } catch (hata) {
      console.error('Yemeksepeti restoran arama hatası:', hata.message);
      return [];
    }
  }

  async restoranMenusuCek(restoranId: string): Promise<UrunVerisi[]> {
    try {
      const yanit = await this.apiIstemcisi.get(
        `/api/v1/restaurants/${restoranId}/menu`,
      );

      return this.urunVerisiniDonustur(yanit.data.items || yanit.data);
    } catch (hata) {
      console.error('Yemeksepeti menü çekme hatası:', hata.message);
      return [];
    }
  }

  // Yemeksepeti API yanıtını standart formata dönüştür
  private urunVerisiniDonustur(veri: any[]): UrunVerisi[] {
    return veri.map((urun) => ({
      platformUrunId: urun.id || urun.productId,
      ad: urun.name || urun.title,
      aciklama: urun.description,
      gorsel: urun.image || urun.imageUrl,
      kategori: urun.category || urun.categoryName,
      restoran: urun.restaurant?.name || urun.restaurantName,
      restoranId: urun.restaurant?.id || urun.restaurantId,
      guncelFiyat: parseFloat(urun.price || urun.originalPrice),
      indirimFiyat: urun.discountPrice
        ? parseFloat(urun.discountPrice)
        : null,
      indirimOrani: urun.discountPercentage || null,
      stokta: urun.available !== false,
      platformUrl: `https://www.yemeksepeti.com/restaurant/${urun.restaurantId}/product/${urun.id}`,
      ozellikler: {
        minSiparisTutari: urun.minOrder,
        teslimatSuresi: urun.deliveryTime,
        ...urun.extra,
      },
    }));
  }

  // İndirim verisini standart formata dönüştür
  private indirimVerisiniDonustur(veri: any[]): IndirimVerisi[] {
    return veri.map((indirim) => ({
      baslik: indirim.title || indirim.name,
      aciklama: indirim.description,
      kod: indirim.code || indirim.couponCode,
      tur: indirim.type || 'kampanya',
      indirimOrani: indirim.discountPercentage,
      indirimMiktari: indirim.discountAmount,
      minimumSiparisTutari: indirim.minOrderAmount,
      maksimumIndirim: indirim.maxDiscount,
      baslangicTarihi: indirim.startDate
        ? new Date(indirim.startDate)
        : null,
      bitisTarihi: indirim.endDate ? new Date(indirim.endDate) : null,
      aktif: indirim.active !== false,
      yeniKullaniciIcin: indirim.newUserOnly || false,
      sartlar: indirim.terms,
    }));
  }

  // Restoran verisini standart formata dönüştür
  private restoranVerisiniDonustur(veri: any[]): RestoranVerisi[] {
    return veri.map((restoran) => ({
      platformRestoranId: restoran.id || restoran.restaurantId,
      ad: restoran.name,
      aciklama: restoran.description,
      gorsel: restoran.logo || restoran.image,
      adres: restoran.address,
      telefon: restoran.phone,
      minSiparisTutari: restoran.minimumOrder,
      teslimatUcreti: restoran.deliveryFee,
      ortalamaTeslimatSuresi: restoran.averageDeliveryTime,
      puan: restoran.rating,
      yorumSayisi: restoran.reviewCount,
      kategoriler: restoran.categories || restoran.cuisines,
      acik: restoran.isOpen !== false,
    }));
  }
}
