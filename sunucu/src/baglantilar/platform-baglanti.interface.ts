// Platform API bağlantısı için temel interface
export interface PlatformBaglanti {
  // Platform adı
  platformAdi(): string;

  // Platform kodu
  platformKodu(): string;

  // API bağlantısını test et
  baglantiTesti(): Promise<boolean>;

  // Ürünleri çek
  urunleriCek(parametreler?: any): Promise<UrunVerisi[]>;

  // Tek bir ürünün detayını çek
  urunDetayiCek(urunId: string): Promise<UrunVerisi>;

  // İndirimleri çek
  indirimleriCek(): Promise<IndirimVerisi[]>;

  // Restoran ara
  restoranAra(arama: string, konum?: Konum): Promise<RestoranVerisi[]>;

  // Restoran menüsünü çek
  restoranMenusuCek(restoranId: string): Promise<UrunVerisi[]>;
}

// Konum bilgisi
export interface Konum {
  enlem: number;
  boylam: number;
  adres?: string;
}

// Standart ürün verisi formatı
export interface UrunVerisi {
  platformUrunId: string;
  ad: string;
  aciklama?: string;
  gorsel?: string;
  kategori: string;
  restoran: string;
  restoranId: string;
  guncelFiyat: number;
  indirimFiyat?: number;
  indirimOrani?: number;
  stokta: boolean;
  platformUrl?: string;
  ozellikler?: Record<string, any>;
}

// Standart indirim verisi formatı
export interface IndirimVerisi {
  baslik: string;
  aciklama?: string;
  kod?: string;
  tur: string;
  indirimOrani?: number;
  indirimMiktari?: number;
  minimumSiparisTutari?: number;
  maksimumIndirim?: number;
  baslangicTarihi?: Date;
  bitisTarihi?: Date;
  aktif: boolean;
  yeniKullaniciIcin?: boolean;
  affiliateLink?: string;
  sartlar?: Record<string, any>;
}

// Standart restoran verisi formatı
export interface RestoranVerisi {
  platformRestoranId: string;
  ad: string;
  aciklama?: string;
  gorsel?: string;
  adres?: string;
  telefon?: string;
  minSiparisTutari?: number;
  teslimatUcreti?: number;
  ortalamaTeslimatSuresi?: number; // dakika cinsinden
  puan?: number;
  yorumSayisi?: number;
  kategoriler?: string[];
  acik: boolean;
}
