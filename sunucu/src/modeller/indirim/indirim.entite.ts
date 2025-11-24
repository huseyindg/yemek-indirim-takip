import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PlatformEntite } from '../platform/platform.entite';

@Entity('indirimler')
export class IndirimEntite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  baslik: string;

  @Column({ type: 'text', nullable: true })
  aciklama: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  kod: string; // İndirim kodu

  @Column({ type: 'varchar', length: 50 })
  tur: string; // 'kod', 'kampanya', 'otomatik'

  @Column({ type: 'int', nullable: true })
  indirimOrani: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  indirimMiktari: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumSiparisTutari: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maksimumIndirim: number;

  // Platform ilişkisi
  @ManyToOne(() => PlatformEntite)
  @JoinColumn({ name: 'platformId' })
  platform: PlatformEntite;

  @Column({ type: 'uuid' })
  @Index()
  platformId: string;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  baslangicTarihi: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  bitisTarihi: Date;

  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  // Kullanım sayısı
  @Column({ type: 'int', default: 0 })
  kullanimSayisi: number;

  // Maksimum kullanım sayısı
  @Column({ type: 'int', nullable: true })
  maksimumKullanim: number;

  // Sadece yeni kullanıcılar için mi?
  @Column({ type: 'boolean', default: false })
  yeniKullaniciIcin: boolean;

  // Affiliate link
  @Column({ type: 'text', nullable: true })
  affiliateLink: string;

  // Ekstra şartlar
  @Column({ type: 'jsonb', nullable: true })
  sartlar: Record<string, any>;

  // Doğrulandı mı? (Kullanıcı bildirimi)
  @Column({ type: 'boolean', default: false })
  dogrulandi: boolean;

  @Column({ type: 'int', default: 0 })
  olumluOy: number;

  @Column({ type: 'int', default: 0 })
  olumsuzOy: number;

  @CreateDateColumn({ type: 'timestamp' })
  olusturulmaTarihi: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  guncellenmeTarihi: Date;
}
