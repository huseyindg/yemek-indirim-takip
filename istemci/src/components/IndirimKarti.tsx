'use client';

import { Indirim, PLATFORM_RENKLER } from '@/types';
import { MapPin, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface IndirimKartiProps {
  indirim: Indirim;
}

export default function IndirimKarti({ indirim }: IndirimKartiProps) {
  const platformRenk = PLATFORM_RENKLER[indirim.platform];

  // Tarih formatla
  const gecenSure = indirim.bulunmaTarihi
    ? formatDistanceToNow(new Date(indirim.bulunmaTarihi), {
        addSuffix: true,
        locale: tr,
      })
    : '';

  // Sahte indirim kontrolü
  const sahteIndirim = indirim.sahteIndirim || false;

  return (
    <div className="indirim-card animate-fade-in">
      {/* Görsel */}
      {indirim.gorsel && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={indirim.gorsel}
            alt={indirim.restoran}
            className="w-full h-full object-cover"
          />
          {/* Platform rozeti */}
          <div
            className={`absolute top-3 left-3 ${platformRenk.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}
          >
            {indirim.platform.charAt(0).toUpperCase() + indirim.platform.slice(1)}
          </div>
          {/* İndirim oranı rozeti */}
          <div className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-lg">
            %{indirim.indirimOrani}
          </div>
        </div>
      )}

      {/* İçerik */}
      <div className="p-5">
        {/* Restoran adı */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {indirim.restoran}
        </h3>

        {/* Ürün adı (varsa) */}
        {indirim.urunAdi && (
          <p className="text-sm text-gray-600 mb-3">{indirim.urunAdi}</p>
        )}

        {/* Kampanya başlığı */}
        {indirim.kampanyaBaslik && (
          <p className="text-sm font-medium text-gray-700 mb-3">
            {indirim.kampanyaBaslik}
          </p>
        )}

        {/* Lokasyon */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {indirim.sehir} - {indirim.bolge}
        </div>

        {/* Fiyat bilgisi (varsa) */}
        {indirim.eskiFiyat > 0 && indirim.yeniFiyat > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Eski Fiyat</p>
                <p className="text-lg text-gray-400 line-through">
                  {indirim.eskiFiyat.toFixed(2)}₺
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Yeni Fiyat</p>
                <p className="text-2xl font-bold text-green-600">
                  {indirim.yeniFiyat.toFixed(2)}₺
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sahte indirim uyarısı */}
        {sahteIndirim ? (
          <div className="sahte-indirim-alert mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Sahte İndirim Uyarısı!</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Bu fiyat son 30 günlük ortalamaya yakın. Gerçek bir indirim olmayabilir.
                </p>
                {indirim.ortalama30Gunluk && (
                  <p className="text-xs text-yellow-700 mt-1">
                    Son 30 gün ortalama: {indirim.ortalama30Gunluk.toFixed(2)}₺
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="gercek-indirim-badge mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Gerçek İndirim</span>
            </div>
          </div>
        )}

        {/* Alt bilgi */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">{gecenSure}</span>
          <a
            href={indirim.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${platformRenk.bg} ${platformRenk.hover} text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-colors`}
          >
            Sipariş Ver
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
