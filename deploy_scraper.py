#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import time
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def deploy_scraper():
    """Deploy scraper changes to server"""

    hostname = "104.248.30.214"
    username = "root"
    password = "nonroot"

    print("Scraper guncellemeleri dagitiliyor...\n")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f">> Sunucuya baglaniliyor: {hostname}")
        ssh.connect(hostname, username=username, password=password, timeout=10)
        print(">> Baglanti basarili\n")

        commands = [
            # Git pull
            "cd yemek-fiyat-takip && echo 'Pulling git changes...'",
            "cd yemek-fiyat-takip && git pull origin main",

            # Rebuild backend container
            "cd yemek-fiyat-takip && echo 'Rebuilding backend container...'",
            "cd yemek-fiyat-takip && docker-compose build sunucu",

            # Restart backend
            "cd yemek-fiyat-takip && echo 'Restarting backend...'",
            "cd yemek-fiyat-takip && docker-compose up -d sunucu",

            # Wait for backend to be ready
            "echo 'Waiting for backend (10 seconds)...'",
            "sleep 10",

            # Check if backend is running
            "cd yemek-fiyat-takip && docker-compose ps sunucu",
        ]

        for cmd in commands:
            print(f">> {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)

            # Print output in real-time
            for line in stdout:
                print(f"  {line.strip()}")

            err = stderr.read().decode()
            if err and 'warning' not in err.lower():
                print(f"  WARNING: {err}")

            time.sleep(0.5)

        print("\n>> Deployment complete!")
        print("\n>> Scraper usage:")
        print("  GET  http://104.248.30.214:3101/scraper/durum - Check scraper status")
        print("  POST http://104.248.30.214:3101/scraper/calistir - Run scraper")

    except paramiko.AuthenticationException:
        print("ERROR: Authentication failed")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"ERROR: SSH connection failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy_scraper()
