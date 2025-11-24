'use client';

import { useState, useEffect } from 'react';
import { IndirimKodu, PLATFORM_RENKLER } from '@/types';
import { Copy, Check, ExternalLink, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function IndirimKodlariSayfasi() {
  const [kodlar, setKodlar] = useState<IndirimKodu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kopyalananKod, setKopyalananKod] = useState<string | null>(null);

  useEffect(() => {
    const kodlariGetir = async () => {
      try {
        const response = await fetch(`${API_URL}/indirimler?aktif=true&limit=20`);
        if (!response.ok) throw new Error('API hatası');

        const veriler = await response.json();
        setKodlar(veriler);
      } catch (err) {
        console.error('Kodlar yüklenirken hata:', err);
        // Demo kodları göster
        setKodlar(demoKodlar);
      } finally {
        setYukleniyor(false);
      }
    };

    kodlariGetir();
  }, []);

  const koduKopyala = (kod: string) => {
    navigator.clipboard.writeText(kod);
    setKopyalananKod(kod);
    setTimeout(() => setKopyalananKod(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Ana Sayfa
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Flame className="w-6 h-6 text-red-500 mr-2" />
            Aktif İndirim Kodları
          </h1>
        </div>
      </header>

      {/* İçerik */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {yukleniyor ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {kodlar.map((kod) => {
              const platformRenk = PLATFORM_RENKLER[kod.platform as keyof typeof PLATFORM_RENKLER];

              return (
                <div
                  key={kod.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-5">
                    {/* Platform rozeti */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`${platformRenk?.bg || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-semibold capitalize`}
                      >
                        {kod.platform}
                      </span>
                      {kod.yeniKullaniciIcin && (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                          ⭐ Yeni Kullanıcılar
                        </span>
                      )}
                    </div>

                    {/* Başlık */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {kod.baslik}
                    </h3>

                    {/* Açıklama */}
                    {kod.aciklama && (
                      <p className="text-sm text-gray-600 mb-4">{kod.aciklama}</p>
                    )}

                    {/* İndirim detayları */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">İndirim</p>
                          <p className="text-lg font-bold text-red-500">
                            {kod.indirimTuru === 'yuzde'
                              ? `%${kod.indirimMiktari}`
                              : `${kod.indirimMiktari}₺`}
                          </p>
                        </div>
                        {kod.minimumSiparis && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Min. Sipariş</p>
                            <p className="text-lg font-bold text-gray-700">
                              {kod.minimumSiparis}₺
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kod */}
                    <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-red-600 mb-1">İndirim Kodu</p>
                          <p className="text-2xl font-mono font-bold text-red-600">
                            {kod.kod}
                          </p>
                        </div>
                        <button
                          onClick={() => koduKopyala(kod.kod)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          {kopyalananKod === kod.kod ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Kopyalandı
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Kopyala
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* İstatistikler */}
                    {(kod.kullanimSayisi || kod.basarliKullanimYuzdesi) && (
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        {kod.kullanimSayisi && (
                          <span>✅ {kod.kullanimSayisi} kişi kullandı</span>
                        )}
                        {kod.basarliKullanimYuzdesi && (
                          <span>👍 %{kod.basarliKullanimYuzdesi} çalıştı</span>
                        )}
                      </div>
                    )}

                    {/* Bitiş tarihi */}
                    {kod.bitisTarihi && (
                      <p className="text-xs text-gray-500 mb-4">
                        📅 {new Date(kod.bitisTarihi).toLocaleDateString('tr-TR')} tarihine kadar
                      </p>
                    )}

                    {/* Kullan butonu */}
                    <button
                      className={`w-full ${platformRenk?.bg || 'bg-gray-500'} ${platformRenk?.hover || 'hover:bg-gray-600'} text-white py-3 rounded-lg font-medium inline-flex items-center justify-center transition-colors`}
                    >
                      Kullan
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!yukleniyor && kodlar.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">Henüz aktif indirim kodu bulunmuyor.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Demo kodlar
const demoKodlar: IndirimKodu[] = [
  {
    id: 'demo-kod-1',
    kod: 'YEMEK40',
    platform: 'yemeksepeti',
    baslik: '%40 İndirim',
    aciklama: 'İlk siparişinizde geçerli',
    indirimTuru: 'yuzde',
    indirimMiktari: 40,
    minimumSiparis: 100,
    yeniKullaniciIcin: true,
    aktif: true,
    kullanimSayisi: 1234,
    basarliKullanimYuzdesi: 89,
  },
  {
    id: 'demo-kod-2',
    kod: 'GETIR20',
    platform: 'getir',
    baslik: '20₺ İndirim',
    aciklama: 'Tüm siparişlerde geçerli',
    indirimTuru: 'sabit',
    indirimMiktari: 20,
    minimumSiparis: 50,
    yeniKullaniciIcin: false,
    aktif: true,
    bitisTarihi: new Date(Date.now() + 86400000), // 1 gün sonra
  },
];
