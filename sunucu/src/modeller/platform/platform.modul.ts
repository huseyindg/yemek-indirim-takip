import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformEntite } from './platform.entite';
import { PlatformServisi } from './platform.servis';
import { PlatformDenetleyici } from './platform.denetleyici';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformEntite])],
  controllers: [PlatformDenetleyici],
  providers: [PlatformServisi],
  exports: [PlatformServisi],
})
export class PlatformModulu {}
