import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ProxyServisi, ProxyAyarlari } from './proxy.servis';

@Injectable()
export class BrowserServisi {
  private tarayicilar: Map<string, Browser> = new Map();

  constructor(private proxyServisi: ProxyServisi) {}

  // Yeni tarayıcı başlat
  async tarayiciyiBaslat(proxy?: ProxyAyarlari): Promise<Browser> {
    const baslatmaAyarlari: any = {
      headless: 'new', // Yeni headless modu
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled', // Automation algılamayı engelle
      ],
    };

    // Proxy varsa ekle
    if (proxy) {
      const proxyUrl = this.proxyServisi.proxyUrlOlustur(proxy);
      baslatmaAyarlari.args.push(`--proxy-server=${proxyUrl}`);
      console.log(`🔒 Proxy kullanılıyor: ${proxy.host}:${proxy.port}`);
    }

    const tarayici = await puppeteer.launch(baslatmaAyarlari);

    // Tarayıcıyı sakla
    const id = Math.random().toString(36).substring(7);
    this.tarayicilar.set(id, tarayici);

    return tarayici;
  }

  // Yeni sayfa oluştur (anti-detection özelliklerle)
  async yeniSayfaOlustur(tarayici: Browser): Promise<Page> {
    const sayfa = await tarayici.newPage();

  // Rastgele User-Agent
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await sayfa.setUserAgent(randomUserAgent);

    // Viewport boyutları (rastgele)
    const genislik = 1920 + Math.floor(Math.random() * 100);
    const yukseklik = 1080 + Math.floor(Math.random() * 100);
    await sayfa.setViewport({ width: genislik, height: yukseklik });

    // JavaScript'i override et (bot tespitini engelle)
    await sayfa.evaluateOnNewDocument(() => {
      // WebDriver özelliğini gizle
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Chrome özelliğini ekle
      (window as any).chrome = {
        runtime: {},
      };

      // Permissions API
      const originalQuery = window.navigator.permissions.query;
      (window.navigator.permissions as any).query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters);

      // Plugin sayısı
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Dil ayarları
      Object.defineProperty(navigator, 'languages', {
        get: () => ['tr-TR', 'tr', 'en-US', 'en'],
      });
    });

    // Request interception - gereksiz kaynaklarını engelle (hızlandırma)
    await sayfa.setRequestInterception(true);
    sayfa.on('request', (request) => {
      const kaynakTuru = request.resourceType();

      // Resim, font, stylesheet engelle (isteğe bağlı)
      if (['image', 'stylesheet', 'font', 'media'].includes(kaynakTuru)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Ekstra header'lar ekle
    await sayfa.setExtraHTTPHeaders({
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    return sayfa;
  }

  // Sayfaya git (retry logic ile)
  async sayfayaGit(
    sayfa: Page,
    url: string,
    denemeSayisi: number = 3,
  ): Promise<void> {
    for (let i = 0; i < denemeSayisi; i++) {
      try {
        console.log(`🌐 Sayfa açılıyor: ${url} (Deneme ${i + 1}/${denemeSayisi})`);

        await sayfa.goto(url, {
          waitUntil: 'networkidle2', // Ağ trafiği bitene kadar bekle
          timeout: 30000, // 30 saniye timeout
        });

        console.log(`✅ Sayfa başarıyla yüklendi: ${url}`);
        return;
      } catch (hata) {
        console.error(`❌ Sayfa yükleme hatası (${i + 1}/${denemeSayisi}):`, hata.message);

        if (i === denemeSayisi - 1) {
          throw new Error(`Sayfa ${denemeSayisi} denemeden sonra yüklenemedi: ${url}`);
        }

        // Tekrar denemeden önce bekle (exponential backoff)
        const bekleme = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
        console.log(`⏱️  ${bekleme / 1000} saniye bekleniyor...`);
        await this.bekle(bekleme);
      }
    }
  }

  // İnsan gibi kaydırma
  async insanGibiKaydir(sayfa: Page): Promise<void> {
    await sayfa.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let toplamYukseklik = 0;
        const mesafe = 100; // Her adımda kaydırma miktarı
        const zamanlayici = setInterval(() => {
          const kaydirmaYuksekligi = document.body.scrollHeight;
          window.scrollBy(0, mesafe);
          toplamYukseklik += mesafe;

          if (toplamYukseklik >= kaydirmaYuksekligi) {
            clearInterval(zamanlayici);
            resolve();
          }
        }, 100); // Her 100ms'de bir kaydır
      });
    });
  }

  // Rastgele mouse hareketi
  async rastgeleMouseHareketi(sayfa: Page): Promise<void> {
    const genislik = sayfa.viewport()?.width || 1920;
    const yukseklik = sayfa.viewport()?.height || 1080;

    // Rastgele bir noktaya git
    const x = Math.floor(Math.random() * genislik);
    const y = Math.floor(Math.random() * yukseklik);

    await sayfa.mouse.move(x, y);
  }

  // Rastgele bekleme (insan gibi)
  async rastgeleBekle(minMs: number = 1000, maxMs: number = 3000): Promise<void> {
    const bekleme = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await this.bekle(bekleme);
  }

  // Bekleme yardımcı fonksiyonu
  private bekle(milisaniye: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milisaniye));
  }

  // Tarayıcıyı kapat
  async tarayiciyiKapat(tarayici: Browser): Promise<void> {
    try {
      await tarayici.close();
      console.log('🔒 Tarayıcı kapatıldı');
    } catch (hata) {
      console.error('❌ Tarayıcı kapatma hatası:', hata);
    }
  }

  // Tüm tarayıcıları kapat
  async tumTarayicilariKapat(): Promise<void> {
    for (const [id, tarayici] of this.tarayicilar) {
      await this.tarayiciyiKapat(tarayici);
      this.tarayicilar.delete(id);
    }
  }

  // Cleanup on module destroy
  async onModuleDestroy() {
    await this.tumTarayicilariKapat();
  }
}
