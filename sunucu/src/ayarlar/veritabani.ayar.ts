import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const veritabaniAyarlari: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.VERITABANI_HOST || 'localhost',
  port: parseInt(process.env.VERITABANI_PORT) || 5432,
  username: process.env.VERITABANI_KULLANICI || 'postgres',
  password: process.env.VERITABANI_SIFRE || 'postgres',
  database: process.env.VERITABANI_ADI || 'yemek_fiyat_takip',
  entities: [__dirname + '/../**/*.entite{.ts,.js}'],
  migrations: [__dirname + '/../veritabani/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};

// Migration'lar için ayrı datasource
export const AppDataSource = new DataSource(
  veritabaniAyarlari as DataSourceOptions,
);
