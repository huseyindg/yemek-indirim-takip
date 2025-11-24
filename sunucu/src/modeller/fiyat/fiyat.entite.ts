import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UrunEntite } from '../urun/urun.entite';

@Entity('fiyat_gecmisi')
@Index(['urunId', 'tarih'])
export class FiyatEntite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UrunEntite, (urun) => urun.fiyatGecmisi)
  @JoinColumn({ name: 'urunId' })
  urun: UrunEntite;

  @Column({ type: 'uuid' })
  @Index()
  urunId: string;

  // Normal fiyat
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fiyat: number;

  // İndirimli fiyat (varsa)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  indirimFiyat: number;

  // İndirim oranı
  @Column({ type: 'int', nullable: true })
  indirimOrani: number;

  // Fiyat türü: 'normal', 'indirim', 'kampanya'
  @Column({ type: 'varchar', length: 50, default: 'normal' })
  tur: string;

  // Fiyat değişikliği mi?
  @Column({ type: 'boolean', default: false })
  degisiklik: boolean;

  // Önceki fiyatla fark
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fiyatFarki: number;

  // Fiyat değişim yüzdesi
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  degisimYuzdesi: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  tarih: Date;
}
