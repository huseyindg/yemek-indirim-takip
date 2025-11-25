#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_URL = "http://104.248.30.214:3101"

print(">> Testing scraper endpoints...\n")

# Test 1: Check scraper status
print("1. Checking scraper status...")
try:
    response = requests.get(f"{API_URL}/scraper/durum", timeout=10)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n2. Triggering scraper (this may take a while)...")
try:
    response = requests.post(f"{API_URL}/scraper/calistir", timeout=300)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n3. Checking active discounts...")
try:
    response = requests.get(f"{API_URL}/indirimler/aktif", timeout=10)
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Total active discounts: {len(data)}")
    if len(data) > 0:
        print(f"   Sample discount: {json.dumps(data[0], indent=2, ensure_ascii=False)[:500]}")
except Exception as e:
    print(f"   ERROR: {e}")
