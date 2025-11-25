#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"

def run_cmd(ssh, cmd, show_output=True):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    if show_output:
        for line in iter(stdout.readline, ""):
            try:
                print(line, end="")
            except:
                print(line.encode('ascii', 'ignore').decode('ascii'), end="")
    return stdout.channel.recv_exit_status() == 0

print(f"Restarting backend to create database tables...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("[OK] Connected!\n")

    print("1. Pulling latest changes...")
    run_cmd(ssh, f"cd {DIR} && git pull")

    print("\n2. Rebuilding backend container...")
    run_cmd(ssh, f"cd {DIR} && docker-compose up -d --build sunucu")

    print("\n3. Waiting for backend to start (10 seconds)...")
    import time
    time.sleep(10)

    print("\n4. Checking if tables were created...")
    stdin, stdout, stderr = ssh.exec_command(
        'docker exec yemek-veritabani psql -U postgres -d yemek_fiyat_takip -c "\\dt"'
    )
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n" + "="*60)
    print("Backend restarted! Tables should be created now.")
    print("="*60)
    print(f"\nCheck your application:")
    print(f"  http://{SERVER}:3100")

except Exception as e:
    print(f"\n[ERROR] {e}")
    import traceback
    traceback.print_exc()
finally:
    ssh.close()
