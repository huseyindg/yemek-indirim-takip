import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PlatformEntite } from '../platform/platform.entite';
import { FiyatEntite } from '../fiyat/fiyat.entite';

@Entity('urunler')
@Index(['platformId', 'platformUrunId'], { unique: true })
export class UrunEntite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  ad: string;

  @Column({ type: 'text', nullable: true })
  aciklama: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gorsel: string;

  @Column({ type: 'varchar', length: 255 })
  kategori: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  restoran: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  restoranId: string;

  // Platform'daki orjinal ürün ID'si
  @Column({ type: 'varchar', length: 255 })
  platformUrunId: string;

  // Platform'daki ürün URL'i
  @Column({ type: 'text', nullable: true })
  platformUrl: string;

  // Mevcut fiyat
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  guncelFiyat: number;

  // İndirim varsa indirimli fiyat
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  indirimFiyat: number;

  // İndirim oranı
  @Column({ type: 'int', nullable: true })
  indirimOrani: number;

  // Stok durumu
  @Column({ type: 'boolean', default: true })
  stokta: boolean;

  // Platform ilişkisi
  @ManyToOne(() => PlatformEntite, (platform) => platform.urunler)
  @JoinColumn({ name: 'platformId' })
  platform: PlatformEntite;

  @Column({ type: 'uuid' })
  @Index()
  platformId: string;

  // Fiyat geçmişi
  @OneToMany(() => FiyatEntite, (fiyat) => fiyat.urun)
  fiyatGecmisi: FiyatEntite[];

  // Sahte indirim algılama
  @Column({ type: 'boolean', default: false })
  sahteIndirim: boolean;

  @Column({ type: 'text', nullable: true })
  sahteIndirimAciklama: string;

  // Ürün özellikleri (ekstra bilgiler)
  @Column({ type: 'jsonb', nullable: true })
  ozellikler: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  olusturulmaTarihi: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  guncellenmeTarihi: Date;

  // Son kontrol tarihi
  @Column({ type: 'timestamp', nullable: true })
  @Index()
  sonKontrolTarihi: Date;
}
