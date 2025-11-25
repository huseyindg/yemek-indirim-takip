#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
REPO = "https://github.com/huseyindg/yemek-indirim-takip.git"
DIR = "/root/yemek-fiyat-takip"

print(f"Connecting to {SERVER}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
    print("Connected!\n")

    commands = [
        ("Removing old files", f"rm -rf {DIR}"),
        ("Cloning repo", f"git clone {REPO} {DIR}"),
        ("Setting permissions", f"chmod +x {DIR}/deploy.sh"),
        ("Starting deployment", f"cd {DIR} && nohup bash ./deploy.sh > deploy.log 2>&1 &"),
    ]

    for desc, cmd in commands:
        print(f"{desc}...")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        stdout.channel.recv_exit_status()
        output = stdout.read().decode('utf-8', errors='ignore')
        if output:
            print(output[:200])
        print(f"  Done\n")

    print("\nDeployment started in background!")
    print(f"\nTo check progress:")
    print(f"  ssh {USERNAME}@{SERVER}")
    print(f"  cd {DIR}")
    print(f"  tail -f deploy.log")
    print(f"\nOr check containers:")
    print(f"  docker ps")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
finally:
    ssh.close()
