import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndirimEntite } from './indirim.entite';
import { IndirimServisi } from './indirim.servis';
import { IndirimDenetleyici } from './indirim.denetleyici';

@Module({
  imports: [TypeOrmModule.forFeature([IndirimEntite])],
  controllers: [IndirimDenetleyici],
  providers: [IndirimServisi],
  exports: [IndirimServisi],
})
export class IndirimModulu {}
