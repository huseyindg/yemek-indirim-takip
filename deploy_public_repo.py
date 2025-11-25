#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys
import time

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
REPO = "https://github.com/huseyindg/yemek-indirim-takip.git"
DIR = "/root/yemek-fiyat-takip"

def run_command(ssh, cmd, description=""):
    if description:
        print(f"\n>> {description}")

    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)

    for line in iter(stdout.readline, ""):
        try:
            print(line, end="")
        except UnicodeEncodeError:
            print(line.encode('ascii', 'ignore').decode('ascii'), end="")

    exit_code = stdout.channel.recv_exit_status()
    return exit_code == 0

print(f"Deploying from GitHub to {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("[OK] Connected!\n")

    # Clean and clone
    print("="*60)
    print("STEP 1: Cloning from GitHub")
    print("="*60)

    if not run_command(ssh, f"rm -rf {DIR} && git clone {REPO} {DIR}", ""):
        print("\n[ERROR] Failed to clone repository")
        sys.exit(1)

    # Run deployment
    print("\n" + "="*60)
    print("STEP 2: Running Deployment (5-10 minutes)")
    print("="*60)
    print("\nThis will:")
    print("  - Install Docker & Docker Compose (if needed)")
    print("  - Build Docker images")
    print("  - Start containers\n")

    if not run_command(ssh, f"cd {DIR} && chmod +x deploy.sh && bash deploy.sh", ""):
        print("\n[ERROR] Deployment failed")
        sys.exit(1)

    # Success
    print("\n\n" + "="*60)
    print("SUCCESS! Application deployed!")
    print("="*60)
    print(f"\nYour application is live at:")
    print(f"  Frontend:    http://{SERVER}:3000")
    print(f"  Backend API: http://{SERVER}:3001")
    print(f"\nUseful commands:")
    print(f"  ssh {USERNAME}@{SERVER}")
    print(f"  cd {DIR}")
    print(f"  docker-compose logs -f       # View logs")
    print(f"  docker-compose ps            # Check status")
    print(f"  docker-compose restart       # Restart all")
    print(f"  docker-compose down          # Stop all")
    print(f"\nTo update in future:")
    print(f"  cd {DIR}")
    print(f"  git pull")
    print(f"  docker-compose down")
    print(f"  docker-compose up -d --build")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    ssh.close()
