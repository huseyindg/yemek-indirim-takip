#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"

print(f"Inserting demo data...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("[OK] Connected!\n")

    # Check if tables exist
    print("1. Checking if tables were created...")
    stdin, stdout, stderr = ssh.exec_command(
        'docker exec yemek-veritabani psql -U postgres -d yemek_fiyat_takip -c "\\dt"'
    )
    output = stdout.read().decode('utf-8', errors='ignore')
    print(output)

    if "indirimler" in output:
        print("\n2. Tables exist! Inserting demo data...")

        # Insert demo discounts
        sql = """
        INSERT INTO indirimler (kod, aciklama, "indirimTipi", "indirimMiktari", "minimumSiparis", "baslangicTarihi", "bitisTarihi", aktif, "olusturulmaTarihi", "guncellenmeTarihi")
        VALUES
        ('YENI50', 'Yeni kullanıcılara özel 50 TL indirim', 'tutar', 50, 100, NOW(), NOW() + interval '30 days', true, NOW(), NOW()),
        ('KAMPANYA30', '30% indirim fırsatı', 'yuzde', 30, 75, NOW(), NOW() + interval '15 days', true, NOW(), NOW()),
        ('HAFTA20', 'Hafta sonu 20 TL indirim', 'tutar', 20, 50, NOW(), NOW() + interval '7 days', true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        """

        stdin, stdout, stderr = ssh.exec_command(
            f'docker exec yemek-veritabani psql -U postgres -d yemek_fiyat_takip -c "{sql}"'
        )
        result = stdout.read().decode('utf-8', errors='ignore')
        print(result)

        print("\n" + "="*60)
        print("SUCCESS! Demo data inserted!")
        print("="*60)
        print(f"\nRefresh your browser:")
        print(f"  http://{SERVER}:3100")
    else:
        print("\n[ERROR] Tables don't exist yet. Backend may still be starting...")
        print("Wait a minute and try again")

except Exception as e:
    print(f"\n[ERROR] {e}")
finally:
    ssh.close()
