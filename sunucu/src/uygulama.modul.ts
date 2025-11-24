import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { veritabaniAyarlari } from './ayarlar/veritabani.ayar';
import { PlatformModulu } from './modeller/platform/platform.modul';
import { UrunModulu } from './modeller/urun/urun.modul';
import { FiyatModulu } from './modeller/fiyat/fiyat.modul';
import { IndirimModulu } from './modeller/indirim/indirim.modul';

@Module({
  imports: [
    // Ortam değişkenleri
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Veritabanı bağlantısı
    TypeOrmModule.forRoot(veritabaniAyarlari),

    // Zamanlanmış görevler
    ScheduleModule.forRoot(),

    // Özellik modülleri
    PlatformModulu,
    UrunModulu,
    FiyatModulu,
    IndirimModulu,
  ],
  controllers: [],
  providers: [],
})
export class UygulamaModulu {}
