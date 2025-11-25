#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def fresh_deploy():
    """Fresh deployment using git clone"""

    hostname = "104.248.30.214"
    username = "root"
    password = "nonroot"

    print("Fresh deployment starting...\n")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f">> Connecting to server: {hostname}")
        ssh.connect(hostname, username=username, password=password, timeout=10)
        print(">> Connected successfully\n")

        commands = [
            # Stop and remove old containers
            "cd yemek-fiyat-takip && echo 'Stopping containers...'",
            "cd yemek-fiyat-takip && docker-compose down",

            # Backup old directory
            "echo 'Backing up old directory...'",
            "mv yemek-fiyat-takip yemek-fiyat-takip.backup.$(date +%s) 2>/dev/null || true",

            # Fresh git clone
            "echo 'Cloning repository...'",
            "git clone https://github.com/huseyindg/yemek-indirim-takip.git yemek-fiyat-takip",

            # Build and start all containers
            "cd yemek-fiyat-takip && echo 'Building containers...'",
            "cd yemek-fiyat-takip && docker-compose build",

            # Start containers
            "cd yemek-fiyat-takip && echo 'Starting containers...'",
            "cd yemek-fiyat-takip && docker-compose up -d",

            # Wait for backend to be ready
            "echo 'Waiting for backend (15 seconds)...'",
            "sleep 15",

            # Check if containers are running
            "cd yemek-fiyat-takip && docker-compose ps",

            # Check backend logs
            "cd yemek-fiyat-takip && echo 'Backend logs:'",
            "cd yemek-fiyat-takip && docker-compose logs --tail=20 sunucu",
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
        print("\n>> API endpoints:")
        print("  Frontend: http://104.248.30.214:3100")
        print("  Backend:  http://104.248.30.214:3101")
        print("  Scraper:  http://104.248.30.214:3101/scraper/durum")
        print("  Trigger:  http://104.248.30.214:3101/scraper/calistir (POST)")

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
    fresh_deploy()
