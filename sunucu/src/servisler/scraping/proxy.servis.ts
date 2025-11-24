import { Injectable } from '@nestjs/common';

export interface ProxyAyarlari {
  host: string;
  port: number;
  kullaniciAdi?: string;
  sifre?: string;
  protokol: 'http' | 'https' | 'socks5';
}

@Injectable()
export class ProxyServisi {
  private proxyListesi: ProxyAyarlari[] = [];
  private suankiIndeks = 0;
  private kullanilabilirProxyler: Set<string> = new Set();

  constructor() {
    this.proxylerYukle();
  }

  // .env dosyasından veya harici servisten proxy listesi yükle
  private proxylerYukle(): void {
    // Örnek proxy'ler - gerçekte .env'den veya API'den alınacak
    const proxyStr = process.env.PROXY_LISTESI || '';

    if (proxyStr) {
      const proxylar = proxyStr.split(',').map((p) => {
        const [host, port] = p.trim().split(':');
        return {
          host,
          port: parseInt(port),
          protokol: 'http' as const,
        };
      });

      this.proxyListesi = proxylar;
      proxylar.forEach((p) =>
        this.kullanilabilirProxyler.add(`${p.host}:${p.port}`),
      );
    }

    // Test için ücretsiz proxy'ler (production'da kullanılmamalı)
    if (process.env.NODE_ENV === 'development' && this.proxyListesi.length === 0) {
      console.warn('⚠️  Proxy listesi boş - IP rotation çalışmayacak!');
      console.warn('💡 .env dosyasına PROXY_LISTESI ekleyin');
      console.warn('💡 Örnek: PROXY_LISTESI=proxy1.com:8080,proxy2.com:3128');
    }
  }

  // Sıradaki proxy'yi al (round-robin)
  sonrakiProxy(): ProxyAyarlari | null {
    if (this.proxyListesi.length === 0) {
      return null;
    }

    const proxy = this.proxyListesi[this.suankiIndeks];
    this.suankiIndeks = (this.suankiIndeks + 1) % this.proxyListesi.length;

    return proxy;
  }

  // Rastgele proxy al
  rastgeleProxy(): ProxyAyarlari | null {
    if (this.proxyListesi.length === 0) {
      return null;
    }

    const rastgeleIndeks = Math.floor(
      Math.random() * this.proxyListesi.length,
    );
    return this.proxyListesi[rastgeleIndeks];
  }

  // Proxy URL formatı oluştur (Puppeteer için)
  proxyUrlOlustur(proxy: ProxyAyarlari): string {
    if (proxy.kullaniciAdi && proxy.sifre) {
      return `${proxy.protokol}://${proxy.kullaniciAdi}:${proxy.sifre}@${proxy.host}:${proxy.port}`;
    }
    return `${proxy.protokol}://${proxy.host}:${proxy.port}`;
  }

  // Proxy'yi kullanılamaz olarak işaretle
  proxyBasarisizOldu(proxy: ProxyAyarlari): void {
    const proxyKey = `${proxy.host}:${proxy.port}`;
    this.kullanilabilirProxyler.delete(proxyKey);

    console.warn(`❌ Proxy başarısız oldu: ${proxyKey}`);

    // Tüm proxy'ler başarısız olursa listeyi sıfırla
    if (this.kullanilabilirProxyler.size === 0) {
      console.warn('⚠️  Tüm proxyler başarısız - liste sıfırlanıyor');
      this.proxylerYukle();
    }
  }

  // Kullanılabilir proxy sayısını al
  kullanilabilirProxySayisi(): number {
    return this.kullanilabilirProxyler.size;
  }

  // Proxy listesine yeni proxy ekle
  proxyEkle(proxy: ProxyAyarlari): void {
    this.proxyListesi.push(proxy);
    this.kullanilabilirProxyler.add(`${proxy.host}:${proxy.port}`);
  }

  // Tüm proxy'leri temizle
  proxyTemizle(): void {
    this.proxyListesi = [];
    this.kullanilabilirProxyler.clear();
    this.suankiIndeks = 0;
  }
}
