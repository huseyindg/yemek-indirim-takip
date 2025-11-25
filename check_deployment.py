#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import time
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"

print(f"Checking deployment status on {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD)

    # Check deploy log (last 30 lines)
    print("="*60)
    print("DEPLOYMENT LOG (last 30 lines):")
    print("="*60)
    stdin, stdout, stderr = ssh.exec_command(f"tail -n 30 {DIR}/deploy.log 2>/dev/null || echo 'Log not found yet'")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n" + "="*60)
    print("DOCKER CONTAINERS STATUS:")
    print("="*60)
    stdin, stdout, stderr = ssh.exec_command("docker ps -a")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n" + "="*60)
    print("DOCKER COMPOSE STATUS:")
    print("="*60)
    stdin, stdout, stderr = ssh.exec_command(f"cd {DIR} && docker-compose ps 2>/dev/null || echo 'Not started yet'")
    print(stdout.read().decode('utf-8', errors='ignore'))

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
finally:
    ssh.close()

print("\n" + "="*60)
print("To monitor deployment in real-time, run:")
print(f"  ssh {USERNAME}@{SERVER}")
print(f"  cd {DIR} && tail -f deploy.log")
print("="*60)
