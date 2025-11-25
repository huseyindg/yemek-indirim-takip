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

    # List directories
    stdin, stdout, stderr = ssh.exec_command("ls -la", get_pty=True)
    print(">> Current directory contents:")
    for line in stdout:
        print(line.strip())

finally:
    ssh.close()
