#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deploy from GitHub to server
"""

import sys
import time

try:
    import paramiko
except ImportError:
    print("[ERROR] paramiko not installed")
    sys.exit(1)

# Server details
SERVER = "104.248.30.214"
USERNAME = "root"
PASSWORD = "nonroot"
GITHUB_REPO = "https://github.com/huseyindg/yemek-indirim-takip.git"
REMOTE_DIR = "/root/yemek-fiyat-takip"

def run_command(ssh, command, description=""):
    """Run a command and print output"""
    if description:
        print(f"\n>> {description}")
    print(f"   Running: {command}")

    stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)

    # Print output in real-time
    for line in iter(stdout.readline, ""):
        try:
            print(line, end="")
        except UnicodeEncodeError:
            print(line.encode('ascii', 'ignore').decode('ascii'), end="")

    exit_code = stdout.channel.recv_exit_status()

    if exit_code != 0:
        print(f"[ERROR] Command failed with exit code {exit_code}")
        stderr_output = stderr.read().decode('utf-8', errors='ignore')
        if stderr_output:
            print(stderr_output)
        return False

    return True

def deploy():
    print(f">> Connecting to {SERVER}...")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD, timeout=30)
        print("[OK] Connected to server\n")

        # 1. Check if directory exists, remove it if it does
        print(">> Checking for existing installation...")
        run_command(ssh, f"rm -rf {REMOTE_DIR}", "Removing old installation")

        # 2. Clone from GitHub
        if not run_command(ssh, f"git clone {GITHUB_REPO} {REMOTE_DIR}", "Cloning from GitHub"):
            print("[ERROR] Failed to clone repository")
            return False

        # 3. Make deploy script executable
        run_command(ssh, f"chmod +x {REMOTE_DIR}/deploy.sh", "Making deploy script executable")

        # 4. Run deployment
        print("\n" + "="*60)
        print("STARTING DEPLOYMENT - This may take 5-10 minutes")
        print("="*60 + "\n")

        if not run_command(ssh, f"cd {REMOTE_DIR} && bash ./deploy.sh", "Running deployment script"):
            print("\n[ERROR] Deployment failed!")
            return False

        print("\n" + "="*60)
        print("[SUCCESS] Deployment completed!")
        print("="*60)
        print(f"\nYour application is now running:")
        print(f"  Frontend:    http://{SERVER}:3000")
        print(f"  Backend API: http://{SERVER}:3001")
        print(f"\nTo view logs:")
        print(f"  ssh {USERNAME}@{SERVER}")
        print(f"  cd {REMOTE_DIR}")
        print(f"  docker-compose logs -f")
        print(f"\nTo stop:")
        print(f"  docker-compose down")
        print(f"\nTo restart:")
        print(f"  docker-compose restart")

        return True

    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        ssh.close()

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)
