#!/usr/bin/env python3
import paramiko
import time
import sys

def deploy_scraper():
    """Deploy scraper changes to server"""

    hostname = "104.248.30.214"
    username = "root"
    password = "nonroot"

    print("🚀 Scraper güncellemeleri dağıtılıyor...\n")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"📡 Sunucuya bağlanılıyor: {hostname}")
        ssh.connect(hostname, username=username, password=password, timeout=10)
        print("✅ Bağlantı başarılı\n")

        commands = [
            # Git pull
            "cd yemek-indirim-takip && echo '📥 Git değişiklikleri çekiliyor...'",
            "cd yemek-indirim-takip && git pull origin main",

            # Rebuild backend container
            "cd yemek-indirim-takip && echo '🔨 Backend container yeniden build ediliyor...'",
            "cd yemek-indirim-takip && docker-compose build sunucu",

            # Restart backend
            "cd yemek-indirim-takip && echo '🔄 Backend yeniden başlatılıyor...'",
            "cd yemek-indirim-takip && docker-compose up -d sunucu",

            # Wait for backend to be ready
            "echo '⏳ Backend hazır olması bekleniyor (10 saniye)...'",
            "sleep 10",

            # Check if backend is running
            "cd yemek-indirim-takip && docker-compose ps sunucu",
        ]

        for cmd in commands:
            print(f"▶ {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)

            # Print output in real-time
            for line in stdout:
                print(f"  {line.strip()}")

            err = stderr.read().decode()
            if err and 'warning' not in err.lower():
                print(f"  ⚠️ {err}")

            time.sleep(0.5)

        print("\n✅ Deployment tamamlandı!")
        print("\n📝 Scraper kullanımı:")
        print("  GET  http://104.248.30.214:3101/scraper/durum - Scraper durumunu kontrol et")
        print("  POST http://104.248.30.214:3101/scraper/calistir - Scraper'ı çalıştır")

    except paramiko.AuthenticationException:
        print("❌ Kimlik doğrulama hatası")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"❌ SSH bağlantı hatası: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy_scraper()
