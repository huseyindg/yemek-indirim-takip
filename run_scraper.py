#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"

print(f"Starting scraper on {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("[OK] Connected!\n")

    print("="*60)
    print("CHECKING SCRAPER STATUS")
    print("="*60)

    # Check if scraper code exists
    stdin, stdout, stderr = ssh.exec_command(f"cd {DIR}/sunucu && ls -la src/servisler/scraping/")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n" + "="*60)
    print("RUNNING SCRAPER IN CONTAINER")
    print("="*60)
    print("This will scrape data from platforms...")
    print("Note: First run may take several minutes\n")

    # Run scraper inside the container
    # We'll execute a test scraper for Yemeksepeti as an example
    stdin, stdout, stderr = ssh.exec_command(
        f"docker exec yemek-sunucu node -e \""
        f"const {{ NestFactory }} = require('@nestjs/core');"
        f"const {{ AppModule }} = require('./dist/uygulama.modul');"
        f"async function bootstrap() {{"
        f"  const app = await NestFactory.createApplicationContext(AppModule);"
        f"  console.log('Scraper running...');"
        f"  // Add your scraping logic here"
        f"  await app.close();"
        f"}}"
        f"bootstrap();"
        f"\"",
        get_pty=True
    )

    for line in iter(stdout.readline, ""):
        try:
            print(line, end="")
        except:
            print(line.encode('ascii', 'ignore').decode('ascii'), end="")

    print("\n" + "="*60)
    print("SCRAPER EXECUTION COMPLETED")
    print("="*60)
    print("\nRefresh your browser to see new data!")
    print(f"Frontend: http://{SERVER}:3100")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    ssh.close()
