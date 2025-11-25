#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
DIR = "/root/yemek-fiyat-takip"

print(f"Running deployment on {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("Connected!\n")

    # Run deploy script with live output
    print("="*60)
    print("RUNNING DEPLOYMENT (this will take 5-10 minutes)")
    print("="*60)
    print("")

    stdin, stdout, stderr = ssh.exec_command(f"cd {DIR} && bash deploy.sh", get_pty=True)

    # Show output
    while True:
        line = stdout.readline()
        if not line:
            break
        try:
            print(line, end='')
        except:
            print(line.encode('ascii', 'ignore').decode('ascii'), end='')

    exit_code = stdout.channel.recv_exit_status()

    if exit_code == 0:
        print("\n\n" + "="*60)
        print("DEPLOYMENT SUCCESSFUL!")
        print("="*60)
        print(f"\nYour application is live at:")
        print(f"  Frontend: http://{SERVER}:3000")
        print(f"  API:      http://{SERVER}:3001")
    else:
        print(f"\n\nDeployment failed with exit code {exit_code}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    ssh.close()
