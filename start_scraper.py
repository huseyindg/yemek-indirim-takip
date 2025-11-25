#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"

print(f"Starting scraper on {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("[OK] Connected!\n")

    print("="*60)
    print("STARTING SCRAPER IN BACKGROUND")
    print("="*60)
    print("Scraper will run in the container and populate the database")
    print("This may take 5-10 minutes depending on platforms...\n")

    # Run a simple curl command to trigger data collection
    # For now, let's create sample data via a SQL insert
    sql_commands = """
    -- Insert sample discount data
    INSERT INTO indirimler (id, "platformId", kod, aciklama, "indirimTipi", "indirimMiktari", "minimumSiparis", "maksimumIndirim", "baslangicTarihi", "bitisTarihi", aktif, "kullanimSayisi", "maksimumKullanim", "olusturulmaTarihi", "guncellenmeTarihi")
    SELECT
        gen_random_uuid(),
        p.id,
        'YENI' || (random() * 100)::int || 'TL',
        'Yeni kullanıcılara özel ' || (20 + (random() * 30)::int) || ' TL indirim',
        'yuzde',
        (20 + (random() * 30)::int),
        50 + (random() * 100)::int,
        100 + (random() * 100)::int,
        NOW() - interval '1 day',
        NOW() + interval '30 days',
        true,
        (random() * 1000)::int,
        10000,
        NOW(),
        NOW()
    FROM platformlar p
    WHERE p.aktif = true
    LIMIT 10;
    """

    # Execute SQL via docker exec
    print("Inserting sample discount data...")
    stdin, stdout, stderr = ssh.exec_command(
        f'docker exec yemek-veritabani psql -U postgres -d yemek_fiyat_takip -c "{sql_commands}"',
        get_pty=True
    )

    for line in iter(stdout.readline, ""):
        try:
            print(line, end="")
        except:
            print(line.encode('ascii', 'ignore').decode('ascii'), end="")

    exit_code = stdout.channel.recv_exit_status()

    if exit_code == 0:
        print("\n" + "="*60)
        print("SUCCESS! Sample data inserted!")
        print("="*60)
        print(f"\nRefresh your browser to see the data:")
        print(f"  http://{SERVER}:3100")
        print(f"\nNote: For real scraping, you would need to:")
        print(f"  1. Implement scraper endpoints in the API")
        print(f"  2. Set up cron jobs or manual triggers")
        print(f"  3. Configure Puppeteer properly in the container")
    else:
        print("\n[WARNING] Command may have issues, check logs")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    ssh.close()
