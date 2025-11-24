import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UrunEntite } from '../urun/urun.entite';

@Entity('platformlar')
export class PlatformEntite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  ad: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  kod: string; // yemeksepeti, getir, trendyol, migros, tiklagelsin

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  websitesi: string;

  @Column({ type: 'text', nullable: true })
  apiAnahtari: string;

  @Column({ type: 'text', nullable: true })
  apiGizliAnahtar: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiUrl: string;

  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @Column({ type: 'int', default: 0 })
  gunlukIstemSayisi: number;

  @Column({ type: 'int', default: 1000 })
  maksimumGunlukIstem: number;

  @Column({ type: 'jsonb', nullable: true })
  ayarlar: Record<string, any>;

  @OneToMany(() => UrunEntite, (urun) => urun.platform)
  urunler: UrunEntite[];

  @CreateDateColumn({ type: 'timestamp' })
  olusturulmaTarihi: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  guncellenmeTarihi: Date;
}
