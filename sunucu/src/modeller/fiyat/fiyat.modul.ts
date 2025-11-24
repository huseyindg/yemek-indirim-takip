import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiyatEntite } from './fiyat.entite';
import { FiyatServisi } from './fiyat.servis';
import { FiyatDenetleyici } from './fiyat.denetleyici';

@Module({
  imports: [TypeOrmModule.forFeature([FiyatEntite])],
  controllers: [FiyatDenetleyici],
  providers: [FiyatServisi],
  exports: [FiyatServisi],
})
export class FiyatModulu {}
