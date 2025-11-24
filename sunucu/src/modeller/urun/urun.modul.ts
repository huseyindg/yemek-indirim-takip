import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrunEntite } from './urun.entite';
import { UrunServisi } from './urun.servis';
import { UrunDenetleyici } from './urun.denetleyici';
import { FiyatModulu } from '../fiyat/fiyat.modul';

@Module({
  imports: [TypeOrmModule.forFeature([UrunEntite]), FiyatModulu],
  controllers: [UrunDenetleyici],
  providers: [UrunServisi],
  exports: [UrunServisi],
})
export class UrunModulu {}
