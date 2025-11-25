#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"

print(f"Checking containers on {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD)

    print("="*60)
    print("CONTAINER STATUS:")
    print("="*60)
    stdin, stdout, stderr = ssh.exec_command(f"cd {DIR} && docker-compose ps")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n" + "="*60)
    print("CONTAINER LOGS (last 20 lines):")
    print("="*60)
    stdin, stdout, stderr = ssh.exec_command(f"cd {DIR} && docker-compose logs --tail=20")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n" + "="*60)
    print("TESTING APPLICATION:")
    print("="*60)

    # Test backend
    stdin, stdout, stderr = ssh.exec_command("curl -s http://localhost:3101/health 2>/dev/null || echo 'Backend not responding'")
    backend_status = stdout.read().decode('utf-8', errors='ignore').strip()
    print(f"Backend (3101): {backend_status}")

    # Test frontend
    stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:3100 2>/dev/null || echo 'Frontend not responding'")
    frontend_status = stdout.read().decode('utf-8', errors='ignore').strip()
    print(f"Frontend (3100): HTTP {frontend_status}")

    print("\n" + "="*60)
    print("APPLICATION URLs:")
    print("="*60)
    print(f"Frontend:    http://{SERVER}:3100")
    print(f"Backend API: http://{SERVER}:3101")

except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
