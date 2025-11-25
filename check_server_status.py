#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"

print(f"Checking server status...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD)

    # Check if directory exists
    print("1. Checking directory...")
    stdin, stdout, stderr = ssh.exec_command(f"ls -la {DIR} 2>/dev/null | head -20 || echo 'Directory not found'")
    print(stdout.read().decode('utf-8', errors='ignore'))

    # Check running processes
    print("\n2. Checking running deployment processes...")
    stdin, stdout, stderr = ssh.exec_command("ps aux | grep -E '(deploy|docker)' | grep -v grep")
    output = stdout.read().decode('utf-8', errors='ignore')
    if output.strip():
        print(output)
    else:
        print("No deployment processes running")

    # Check Docker
    print("\n3. Checking Docker status...")
    stdin, stdout, stderr = ssh.exec_command("docker ps -a")
    print(stdout.read().decode('utf-8', errors='ignore'))

    # Check deploy script
    print("\n4. Checking deploy.sh...")
    stdin, stdout, stderr = ssh.exec_command(f"test -f {DIR}/deploy.sh && echo 'EXISTS' || echo 'NOT FOUND'")
    print(f"deploy.sh: {stdout.read().decode('utf-8', errors='ignore').strip()}")

except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
