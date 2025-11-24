import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UygulamaModulu } from './uygulama.modul';

async function uygulamayiBaslat() {
  const uygulama = await NestFactory.create(UygulamaModulu, {
    cors: true,
  });

  // Global validasyon pipe'ı
  uygulama.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  uygulama.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await uygulama.listen(port);

  console.log(`🚀 Sunucu ${port} portunda çalışıyor`);
  console.log(`📡 API: http://localhost:${port}/api/v1`);
}

uygulamayiBaslat();
