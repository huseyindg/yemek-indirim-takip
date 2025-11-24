'use client';

import { useState } from 'react';
import { Indirim, Bolge } from '@/types';
import IndirimKarti from '@/components/IndirimKarti';
import BolgeSecici from '@/components/BolgeSecici';
import { Flame } from 'lucide-react';
import Link from 'next/link';

// Demo data
const demoIndirimler: Indirim[] = [
  {
    id: '1',
    platform: 'yemeksepeti',
    restoran: 'Burger King',
    restoranId: 'bk-1',
    urunAdi: 'Whopper Menü',
    kategori: 'Fast Food',
    eskiFiyat: 150,
    yeniFiyat: 99,
    indirimOrani: 34,
    bolge: 'kadikoy',
    sehir: 'istanbul',
    kampanyaBaslik: 'Whopper Menü İndirimi',
    kampanyaAciklama: '34% indirimle Whopper Menü fırsatı',
    url: 'https://www.yemeksepeti.com',
    bulunmaTarihi: new Date("2025-01-15T10:00:00"),
    sahteIndirim: false,
  },
  {
    id: '2',
    platform: 'getir',
    restoran: 'Dominos Pizza',
    restoranId: 'dom-1',
    urunAdi: 'Orta Boy Pizza',
    kategori: 'Pizza',
    eskiFiyat: 200,
    yeniFiyat: 129,
    indirimOrani: 36,
    bolge: 'kadikoy',
    sehir: 'istanbul',
    kampanyaBaslik: 'Pizza İndirimi',
    kampanyaAciklama: '36% indirimle orta boy pizza',
    url: 'https://getir.com',
    bulunmaTarihi: new Date("2025-01-15T10:00:00"),
    sahteIndirim: false,
  },
  {
    id: '3',
    platform: 'trendyol',
    restoran: 'Starbucks',
    restoranId: 'sb-1',
    urunAdi: 'Kahve + Tatlı İkili',
    kategori: 'Kahve',
    eskiFiyat: 180,
    yeniFiyat: 149,
    indirimOrani: 17,
    bolge: 'kadikoy',
    sehir: 'istanbul',
    kampanyaBaslik: 'Kahve Tatlı İkilisi',
    kampanyaAciklama: '17% indirimle kahve ve tatlı',
    url: 'https://www.trendyolyemek.com',
    bulunmaTarihi: new Date("2025-01-15T10:00:00"),
    sahteIndirim: false,
  },
];

export default function AnaSayfa() {
  const [secilenBolge, setSecilenBolge] = useState<Bolge>({
    id: '1',
    sehir: 'istanbul',
    semt: 'kadikoy',
  });

  const indirimler = demoIndirimler;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Yemek İndirim Takip
              </h1>
            </div>
            
            <nav className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md font-medium"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/kodlar"
                className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md font-medium"
              >
                İndirim Kodları
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bölge Seçici */}
        <div className="mb-8">
          <BolgeSecici
            secilenBolge={secilenBolge}
            onBolgeSecildi={setSecilenBolge}
          />
        </div>

        {/* İndirim Sayısı */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {indirimler.length} Aktif İndirim Bulundu
          </h2>
          <p className="text-gray-600 mt-1">
            {secilenBolge.sehir} / {secilenBolge.semt} bölgesi için en yeni indirimler
          </p>
        </div>

        {/* İndirim Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indirimler.map((indirim) => (
            <IndirimKarti key={indirim.id} indirim={indirim} />
          ))}
        </div>

        {/* Demo Bilgisi */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-center">
            <strong>Demo Modu:</strong> Şu anda demo verileri görüyorsunuz. 
            Backend scraper çalıştırıldığında gerçek veriler gösterilecek.
          </p>
        </div>
      </main>
    </div>
  );
}
