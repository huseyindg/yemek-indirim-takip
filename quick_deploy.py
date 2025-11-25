#!/usr/bin/env python3
import paramiko, time, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("104.248.30.214", username="root", password="nonroot", timeout=10)

for cmd in [
    "cd yemek-fiyat-takip && git pull",
    "cd yemek-fiyat-takip && docker-compose build sunucu 2>&1 | grep -E '(^Step|ERROR|WARNING|sunucu)'",
    "cd yemek-fiyat-takip && docker-compose up -d sunucu",
    "sleep 10 && cd yemek-fiyat-takip && docker-compose logs --tail=20 sunucu"
]:
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    for line in stdout: print(line.strip())
    time.sleep(0.5)

ssh.close()
print("\nTest: http://104.248.30.214:3101/api/v1/scraper/durum")
