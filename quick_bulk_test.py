#!/usr/bin/env python3
"""
Quick test with fewer leads to verify the endpoint works under gateway timeout
"""

import requests
import time
import json

BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

def test_bulk_with_fewer_leads(num_leads):
    """Test with fewer leads to stay under gateway timeout"""
    print(f"\n{'='*80}")
    print(f"TEST: POST /api/outreach/bulk with {num_leads} leads")
    print('='*80)
    
    url = f"{BASE_URL}/outreach/bulk"
    lead_ids = [f"lead_{str(i+1).zfill(3)}" for i in range(num_leads)]
    
    payload = {
        "leadIds": lead_ids,
        "type": "cold_email",
        "tone": "consultative"
    }
    
    print(f"URL: {url}")
    print(f"Lead IDs: {lead_ids}")
    print(f"\nSending request...")
    
    start_time = time.time()
    
    try:
        response = requests.post(url, json=payload, timeout=180)
        elapsed = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            
            print(f"\nResults count: {len(results)}")
            
            success_count = 0
            for i, result in enumerate(results):
                leadId = result.get('leadId', 'unknown')
                if 'content' in result and len(result['content']) > 100:
                    print(f"  [{i+1}] {leadId}: ✓ content ({len(result['content'])} chars)")
                    success_count += 1
                elif 'error' in result:
                    print(f"  [{i+1}] {leadId}: ❌ error: {result['error']}")
            
            print(f"\n✅ SUCCESS: {success_count}/{len(results)} with content")
            return True
        else:
            print(f"❌ FAIL: Status {response.status_code}")
            print(f"Response: {response.text[:300]}")
            return False
            
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ FAIL after {elapsed:.2f}s: {str(e)}")
        return False

# Test with different numbers of leads
print("\nTesting bulk outreach with varying lead counts to identify gateway timeout threshold")

for num in [3, 5, 8]:
    result = test_bulk_with_fewer_leads(num)
    time.sleep(2)  # Brief pause between tests
