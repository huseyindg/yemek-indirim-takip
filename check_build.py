#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

hostname = "104.248.30.214"
username = "root"
password = "nonroot"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(hostname, username=username, password=password, timeout=10)

    # Run npm build to see errors
    stdin, stdout, stderr = ssh.exec_command("cd yemek-fiyat-takip/sunucu && npm run build 2>&1", get_pty=True)
    print(">> Build output:")
    for line in stdout:
        print(line.strip())

finally:
    ssh.close()
