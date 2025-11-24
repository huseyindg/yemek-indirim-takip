// İndirim verisi
export interface Indirim {
  id: string;
  platform: 'yemeksepeti' | 'getir' | 'trendyol' | 'migros';

  // Restoran/Ürün bilgisi
  restoran: string;
  restoranId: string;
  urunAdi?: string;
  kategori?: string;
  gorsel?: string;

  // Fiyat bilgileri
  eskiFiyat: number;
  yeniFiyat: number;
  indirimOrani: number;

  // Sahte indirim tespiti
  sahteIndirim?: boolean;
  ortalama30Gunluk?: number;
  gercekIndirimOrani?: number;

  // Lokasyon
  bolge: string;
  sehir: string;

  // Meta
  kampanyaBaslik?: string;
  kampanyaAciklama?: string;
  bitisTarihi?: string;
  url: string;

  // Zamanlama
  bulunmaTarihi: Date;
  olusturulmaTarihi?: any; // Firestore Timestamp
}

// İndirim kodu
export interface IndirimKodu {
  id: string;
  kod: string;
  platform: string;

  baslik: string;
  aciklama?: string;

  // İndirim detayları
  indirimTuru: 'yuzde' | 'sabit';
  indirimMiktari: number;
  minimumSiparis?: number;
  maksimumIndirim?: number;

  // Kullanılabilirlik
  yeniKullaniciIcin: boolean;
  kullanimSayisi?: number;
  basarliKullanimYuzdesi?: number;

  // Tarih
  baslangicTarihi?: Date;
  bitisTarihi?: Date;
  aktif: boolean;

  // Sosyal
  olumluOy?: number;
  olumsuzOy?: number;
}

// Bölge
export interface Bolge {
  id: string;
  sehir: string;
  semt: string;
  mahalle?: string;
}

// Platform renkleri
export const PLATFORM_RENKLER = {
  yemeksepeti: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    hover: 'hover:bg-red-600',
  },
  getir: {
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    hover: 'hover:bg-purple-600',
  },
  trendyol: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    hover: 'hover:bg-orange-600',
  },
  migros: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    hover: 'hover:bg-blue-600',
  },
};
