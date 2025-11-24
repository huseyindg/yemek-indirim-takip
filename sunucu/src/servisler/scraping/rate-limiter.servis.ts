import { Injectable } from '@nestjs/common';

interface IstemZamanlari {
  [platform: string]: number[]; // Son istem zamanları
}

@Injectable()
export class RateLimiterServisi {
  private istemZamanlari: IstemZamanlari = {};

  // Platform başına minimum bekleme süresi (milisaniye)
  private readonly platformAyarlari = {
    yemeksepeti: {
      minBekleme: 3000, // 3 saniye
      maxBekleme: 7000, // 7 saniye
      dakikadaMaksIstem: 15, // Dakikada max 15 istek
    },
    getir: {
      minBekleme: 4000, // 4 saniye
      maxBekleme: 8000, // 8 saniye
      dakikadaMaksIstem: 12,
    },
    trendyol: {
      minBekleme: 2500, // 2.5 saniye
      maxBekleme: 6000, // 6 saniye
      dakikadaMaksIstem: 20,
    },
    migros: {
      minBekleme: 3500, // 3.5 saniye
      maxBekleme: 7500, // 7.5 saniye
      dakikadaMaksIstem: 15,
    },
    tiklagelsin: {
      minBekleme: 4000, // 4 saniye
      maxBekleme: 8000, // 8 saniye
      dakikadaMaksIstem: 10,
    },
  };

  constructor() {
    // İstem geçmişini başlat
    Object.keys(this.platformAyarlari).forEach((platform) => {
      this.istemZamanlari[platform] = [];
    });
  }

  // İstek yapmadan önce bekle
  async istekOncesiBekle(platformKodu: string): Promise<void> {
    const ayarlar = this.platformAyarlari[platformKodu];

    if (!ayarlar) {
      console.warn(`⚠️  Platform bulunamadı: ${platformKodu}`);
      // Varsayılan olarak 3-6 saniye bekle
      const bekleme = this.rastgeleBekleme(3000, 6000);
      await this.bekle(bekleme);
      return;
    }

    // Son isteğe göre bekle
    await this.sonIstegeGoreBekle(platformKodu, ayarlar);

    // Dakika limiti kontrolü
    await this.dakikaLimitiKontrol(platformKodu, ayarlar);

    // İsteği kaydet
    this.istekKaydet(platformKodu);
  }

  // Son isteğe göre bekleme
  private async sonIstegeGoreBekle(
    platformKodu: string,
    ayarlar: any,
  ): Promise<void> {
    const sonIstemler = this.istemZamanlari[platformKodu];

    if (sonIstemler.length > 0) {
      const sonIstem = sonIstemler[sonIstemler.length - 1];
      const gecenSure = Date.now() - sonIstem;

      // Minimum bekleme süresini geçmediyse bekle
      if (gecenSure < ayarlar.minBekleme) {
        const ekBekleme = ayarlar.minBekleme - gecenSure;

        // Rastgele bir miktar daha ekle (doğal görünsün)
        const rastgeleFark = Math.random() * 2000; // 0-2 saniye arası
        const toplamBekleme = ekBekleme + rastgeleFark;

        console.log(
          `⏱️  ${platformKodu} için ${Math.round(toplamBekleme / 1000)} saniye bekleniyor...`,
        );
        await this.bekle(toplamBekleme);
      } else {
        // Yine de rastgele bir süre bekle (tahmin edilemez olsun)
        const bekleme = this.rastgeleBekleme(
          ayarlar.minBekleme,
          ayarlar.maxBekleme,
        );
        console.log(
          `⏱️  ${platformKodu} için ${Math.round(bekleme / 1000)} saniye (rastgele) bekleniyor...`,
        );
        await this.bekle(bekleme);
      }
    }
  }

  // Dakika limit kontrolü
  private async dakikaLimitiKontrol(
    platformKodu: string,
    ayarlar: any,
  ): Promise<void> {
    const birDakikaOnce = Date.now() - 60000; // 1 dakika önce
    const sonIstemler = this.istemZamanlari[platformKodu];

    // Son 1 dakikadaki istekleri filtrele
    const sonDakikadakiIstemler = sonIstemler.filter(
      (zaman) => zaman > birDakikaOnce,
    );

    // Limit aşılmışsa bekle
    if (sonDakikadakiIstemler.length >= ayarlar.dakikadaMaksIstem) {
      const enEskiIstem = sonDakikadakiIstemler[0];
      const bekleme = 60000 - (Date.now() - enEskiIstem) + 1000; // 1 saniye ekstra

      console.warn(
        `⚠️  ${platformKodu} dakika limiti aşıldı! ${Math.round(bekleme / 1000)} saniye bekleniyor...`,
      );
      await this.bekle(bekleme);

      // Eski kayıtları temizle
      this.istemZamanlari[platformKodu] = this.istemZamanlari[
        platformKodu
      ].filter((zaman) => zaman > Date.now() - 60000);
    }
  }

  // İsteği kaydet
  private istekKaydet(platformKodu: string): void {
    if (!this.istemZamanlari[platformKodu]) {
      this.istemZamanlari[platformKodu] = [];
    }

    this.istemZamanlari[platformKodu].push(Date.now());

    // Son 100 kaydı tut (memory leak önleme)
    if (this.istemZamanlari[platformKodu].length > 100) {
      this.istemZamanlari[platformKodu] = this.istemZamanlari[
        platformKodu
      ].slice(-100);
    }
  }

  // Rastgele bekleme süresi hesapla
  private rastgeleBekleme(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Bekleme yardımcı fonksiyonu
  private bekle(milisaniye: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milisaniye));
  }

  // İstatistikler
  istatistikleriGetir(): Record<string, any> {
    const istatistikler = {};

    Object.keys(this.istemZamanlari).forEach((platform) => {
      const sonIstemler = this.istemZamanlari[platform];
      const birDakikaOnce = Date.now() - 60000;
      const sonDakikadakiIstemler = sonIstemler.filter(
        (z) => z > birDakikaOnce,
      );

      istatistikler[platform] = {
        toplamIstek: sonIstemler.length,
        sonDakikadakiIstem: sonDakikadakiIstemler.length,
        limit: this.platformAyarlari[platform]?.dakikadaMaksIstem || 0,
      };
    });

    return istatistikler;
  }

  // Tüm kayıtları sıfırla
  sifirla(): void {
    Object.keys(this.istemZamanlari).forEach((platform) => {
      this.istemZamanlari[platform] = [];
    });
  }
}
