'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Bolge } from '@/types';

interface BolgeSeciciProps {
  secilenBolge: Bolge;
  onBolgeSecildi: (bolge: Bolge) => void;
}

// Örnek bölge listesi (gerçek uygulamada API'den gelecek)
const BOLGELER: Bolge[] = [
  { id: '1', sehir: 'istanbul', semt: 'kadikoy' },
  { id: '2', sehir: 'istanbul', semt: 'besiktas' },
  { id: '3', sehir: 'istanbul', semt: 'sisli' },
  { id: '4', sehir: 'istanbul', semt: 'uskudar' },
  { id: '5', sehir: 'ankara', semt: 'cankaya' },
  { id: '6', sehir: 'ankara', semt: 'kecioren' },
  { id: '7', sehir: 'izmir', semt: 'karsiyaka' },
  { id: '8', sehir: 'izmir', semt: 'bornova' },
];

export default function BolgeSecici({ secilenBolge, onBolgeSecildi }: BolgeSeciciProps) {
  const [acik, setAcik] = useState(false);

  const bolgeSecildi = (bolge: Bolge) => {
    onBolgeSecildi(bolge);
    setAcik(false);
  };

  return (
    <div className="relative">
      {/* Seçilen bölge */}
      <button
        onClick={() => setAcik(!acik)}
        className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all w-full"
      >
        <MapPin className="w-5 h-5 text-red-500" />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900 capitalize">
            {secilenBolge.semt}, {secilenBolge.sehir}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            acik ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown listesi */}
      {acik && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setAcik(false)}
          />

          {/* Liste */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-20 max-h-80 overflow-auto">
            {BOLGELER.map((bolge) => (
              <button
                key={bolge.id}
                onClick={() => bolgeSecildi(bolge)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors capitalize ${
                  bolge.id === secilenBolge.id ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                }`}
              >
                {bolge.semt}, {bolge.sehir}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
