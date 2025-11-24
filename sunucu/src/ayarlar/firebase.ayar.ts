import * as admin from 'firebase-admin';
import * as path from 'path';

// Firebase Admin SDK başlat
try {
  const serviceAccountPath = path.join(
    __dirname,
    '../..',
    'firebase-admin-key.json',
  );

  // Service account dosyası varsa kullan
  try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('🔥 Firebase Admin SDK başlatıldı (Service Account)');
  } catch (error) {
    // Service account yoksa default credentials kullan
    admin.initializeApp();
    console.log('🔥 Firebase Admin SDK başlatıldı (Default Credentials)');
  }
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error.message);
  console.warn('⚠️  Firebase olmadan devam ediliyor...');
}

// Firestore database instance
export const firestore = admin.apps.length > 0 ? admin.firestore() : null;

// Authentication instance
export const auth = admin.apps.length > 0 ? admin.auth() : null;

// Firestore collection helper'ları
export const collections = {
  platformlar: () => firestore?.collection('platformlar'),
  urunler: () => firestore?.collection('urunler'),
  indirimler: () => firestore?.collection('indirimler'),
  fiyatGecmisi: (urunId: string) =>
    firestore?.collection('urunler').doc(urunId).collection('fiyatGecmisi'),
};

// Timestamp helper
export const timestamp = () => admin.firestore.FieldValue.serverTimestamp();

export default admin;
