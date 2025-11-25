#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
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

print(f"Clean deployment with cache cleanup...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("[OK] Connected!\n")

    print("="*60)
    print("STEP 1: Pulling latest changes")
    print("="*60)
    run_command(ssh, f"cd {DIR} && git pull", "")

    print("\n" + "="*60)
    print("STEP 2: Stopping containers and cleaning Docker cache")
    print("="*60)
    run_command(ssh, f"cd {DIR} && docker-compose down", "")
    run_command(ssh, "docker system prune -af --volumes", "Cleaning Docker cache (this may take a minute)")

    print("\n" + "="*60)
    print("STEP 3: Building and starting containers")
    print("="*60)
    if not run_command(ssh, f"cd {DIR} && docker-compose up -d --build", ""):
        print("\n[ERROR] Build/start failed")
        sys.exit(1)

    print("\n" + "="*60)
    print("SUCCESS! Application deployed!")
    print("="*60)
    print(f"\nYour application is live at:")
    print(f"  Frontend:    http://{SERVER}:3100")
    print(f"  Backend API: http://{SERVER}:3101")
    print(f"\nCheck containers:")
    print(f"  docker-compose ps")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    ssh.close()
