import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndirimEntite } from '../modeller/indirim/indirim.entite';
import { PlatformEntite } from '../modeller/platform/platform.entite';
import { ScraperServisi } from './scraper.servis';
import { ScraperDenetleyici } from './scraper.denetleyici';

@Module({
  imports: [TypeOrmModule.forFeature([IndirimEntite, PlatformEntite])],
  controllers: [ScraperDenetleyici],
  providers: [ScraperServisi],
  exports: [ScraperServisi],
})
export class ScraperModulu {}
