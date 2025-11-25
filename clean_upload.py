#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
from scp import SCPClient
import os

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"
ARCHIVE = "yemek-deploy.tar.gz"

print(f"Clean upload to {SERVER}...\n")

if not os.path.exists(ARCHIVE):
    print(f"[ERROR] {ARCHIVE} not found!")
    exit(1)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
    print("[OK] Connected\n")

    # 1. Clean old directory
    print("1. Cleaning old directory...")
    stdin, stdout, stderr = ssh.exec_command(f"rm -rf {DIR} && mkdir -p {DIR}")
    stdout.channel.recv_exit_status()
    print("   Done\n")

    # 2. Upload archive
    print(f"2. Uploading {ARCHIVE} (this may take 1-2 minutes)...")
    with SCPClient(ssh.get_transport(), progress=lambda x, y: None) as scp:
        scp.put(ARCHIVE, f"/tmp/{ARCHIVE}")
    print("   Done\n")

    # 3. Extract
    print("3. Extracting files...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {DIR} && tar -xzf /tmp/{ARCHIVE} && rm /tmp/{ARCHIVE}")
    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0:
        print(f"   [ERROR] Exit code: {exit_code}")
        print(stderr.read().decode())
        exit(1)
    print("   Done\n")

    # 4. Verify files
    print("4. Verifying files...")
    stdin, stdout, stderr = ssh.exec_command(f"ls -la {DIR} | head -15")
    print(stdout.read().decode('utf-8', errors='ignore'))

    # 5. Set permissions
    print("5. Setting permissions...")
    stdin, stdout, stderr = ssh.exec_command(f"chmod +x {DIR}/deploy.sh")
    stdout.channel.recv_exit_status()
    print("   Done\n")

    print("="*60)
    print("[SUCCESS] Files uploaded!")
    print("="*60)
    print("\nNow starting deployment...")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
    exit(1)
finally:
    ssh.close()
