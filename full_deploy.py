#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import paramiko
import sys

SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
REPO = "https://github.com/huseyindg/yemek-indirim-takip.git"
DIR = "/root/yemek-fiyat-takip"

def run_cmd(ssh, cmd, show_output=True):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    output_lines = []
    while True:
        line = stdout.readline()
        if not line:
            break
        output_lines.append(line)
        if show_output:
            try:
                print(line, end='')
            except:
                print(line.encode('ascii', 'ignore').decode('ascii'), end='')

    exit_code = stdout.channel.recv_exit_status()
    return exit_code, ''.join(output_lines)

print(f"Deploying to {SERVER}...\n")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
    print("Connected!\n")

    # Step 1: Clone repo
    print("="*60)
    print("STEP 1: Cloning repository")
    print("="*60)
    run_cmd(ssh, f"rm -rf {DIR}")
    exit_code, output = run_cmd(ssh, f"git clone {REPO} {DIR}")
    if exit_code != 0:
        print(f"\nFailed to clone repository (exit code: {exit_code})")
        sys.exit(1)
    print("\n")

    # Step 2: Run deployment
    print("="*60)
    print("STEP 2: Running deployment script (5-10 minutes)")
    print("="*60)
    print("")

    exit_code, output = run_cmd(ssh, f"cd {DIR} && chmod +x deploy.sh && bash deploy.sh")

    if exit_code == 0:
        print("\n\n" + "="*60)
        print("SUCCESS! Application deployed!")
        print("="*60)
        print(f"\nYour application is running at:")
        print(f"  Frontend: http://{SERVER}:3000")
        print(f"  API:      http://{SERVER}:3001")
        print(f"\nUseful commands:")
        print(f"  ssh {USERNAME}@{SERVER}")
        print(f"  cd {DIR}")
        print(f"  docker-compose logs -f      # View logs")
        print(f"  docker-compose ps           # Check status")
        print(f"  docker-compose restart      # Restart")
        print(f"  docker-compose down         # Stop")
    else:
        print(f"\n\nDeployment failed (exit code: {exit_code})")
        sys.exit(1)

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    ssh.close()
