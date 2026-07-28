#!/usr/bin/env python3
"""
Bug Fix Verification Test for POST /api/outreach/bulk and POST /api/import/csv
Tests sequential processing with retry logic to avoid 502 errors from LLM burst rate limits.
"""

import requests
import time
import json

BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

def test_bulk_outreach():
    """
    Test POST /api/outreach/bulk with 8 leads.
    Expected: HTTP 200, results.length === 8, at least 7 with content (not error)
    Timeout: 180 seconds (sequential processing with retries takes time)
    """
    print("\n" + "="*80)
    print("TEST 1: POST /api/outreach/bulk with 8 leads")
    print("="*80)
    
    url = f"{BASE_URL}/outreach/bulk"
    payload = {
        "leadIds": [
            "lead_001", "lead_002", "lead_003", "lead_004",
            "lead_005", "lead_006", "lead_007", "lead_008"
        ],
        "type": "cold_email",
        "tone": "consultative"
    }
    
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print(f"Expected: HTTP 200, 8 results, at least 7 with content (>100 chars)")
    print(f"Timeout: 180 seconds (sequential processing with retries)")
    print("\nSending request...")
    
    start_time = time.time()
    
    try:
        response = requests.post(url, json=payload, timeout=180)
        elapsed = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response body: {response.text[:500]}")
            return False
        
        data = response.json()
        print(f"\nResponse structure:")
        print(f"  - type: {data.get('type')}")
        print(f"  - tone: {data.get('tone')}")
        print(f"  - results count: {len(data.get('results', []))}")
        
        results = data.get('results', [])
        
        # Check results length
        if len(results) != 8:
            print(f"❌ FAIL: Expected 8 results, got {len(results)}")
            return False
        print(f"✓ Results count is 8")
        
        # Check each result
        success_count = 0
        error_count = 0
        
        for i, result in enumerate(results):
            leadId = result.get('leadId', 'unknown')
            has_content = 'content' in result and result['content']
            has_error = 'error' in result
            
            if has_content:
                content_len = len(result['content'])
                if content_len > 100:
                    print(f"  [{i+1}] {leadId}: ✓ content ({content_len} chars)")
                    success_count += 1
                else:
                    print(f"  [{i+1}] {leadId}: ⚠ content too short ({content_len} chars)")
            elif has_error:
                print(f"  [{i+1}] {leadId}: ❌ error: {result['error']}")
                error_count += 1
            else:
                print(f"  [{i+1}] {leadId}: ❌ no content or error field")
                error_count += 1
        
        print(f"\nSummary: {success_count} success, {error_count} errors")
        
        # Check if at least 7 have content
        if success_count < 7:
            print(f"❌ FAIL: Expected at least 7 with content, got {success_count}")
            return False
        
        print(f"✓ At least 7 results have content (>100 chars)")
        print(f"\n✅ TEST PASSED")
        print(f"Response time: {elapsed:.2f}s")
        return True
        
    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"❌ FAIL: Request timed out after {elapsed:.2f} seconds")
        return False
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ FAIL: Exception after {elapsed:.2f} seconds: {str(e)}")
        return False


def test_csv_import():
    """
    Test POST /api/import/csv with 3 rows.
    Expected: HTTP 200, enriched data with buyingSignals and coldEmail for each row
    Timeout: 120 seconds (sequential processing with retries)
    """
    print("\n" + "="*80)
    print("TEST 2: POST /api/import/csv with 3 rows")
    print("="*80)
    
    url = f"{BASE_URL}/import/csv"
    payload = {
        "rows": [
            {
                "name": "Alice",
                "title": "CRO",
                "company": "TestCorp",
                "industry": "SaaS",
                "location": "NYC"
            },
            {
                "name": "Bob",
                "title": "CTO",
                "company": "BuildCo",
                "industry": "Devtools",
                "location": "SF"
            },
            {
                "name": "Cara",
                "title": "VP Sales",
                "company": "GrowInc",
                "industry": "Fintech",
                "location": "London"
            }
        ]
    }
    
    print(f"URL: {url}")
    print(f"Payload: 3 rows (Alice/CRO, Bob/CTO, Cara/VP Sales)")
    print(f"Expected: HTTP 200, 3 enriched results with buyingSignals + coldEmail")
    print(f"Timeout: 120 seconds")
    print("\nSending request...")
    
    start_time = time.time()
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        elapsed = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response body: {response.text[:500]}")
            return False
        
        data = response.json()
        enriched = data.get('enriched', [])
        
        print(f"\nResponse structure:")
        print(f"  - count: {data.get('count')}")
        print(f"  - enriched count: {len(enriched)}")
        
        # Check enriched count
        if len(enriched) != 3:
            print(f"❌ FAIL: Expected 3 enriched results, got {len(enriched)}")
            return False
        print(f"✓ Enriched count is 3")
        
        # Check each enriched result
        success_count = 0
        
        for i, item in enumerate(enriched):
            name = item.get('name', 'unknown')
            has_signals = 'buyingSignals' in item and isinstance(item['buyingSignals'], list) and len(item['buyingSignals']) > 0
            has_email = 'coldEmail' in item and item['coldEmail'] and len(item['coldEmail']) > 50
            has_error = 'error' in item
            
            if has_error:
                print(f"  [{i+1}] {name}: ❌ error: {item['error']}")
            elif has_signals and has_email:
                signals_count = len(item['buyingSignals'])
                email_len = len(item['coldEmail'])
                print(f"  [{i+1}] {name}: ✓ {signals_count} signals, coldEmail ({email_len} chars)")
                success_count += 1
            else:
                print(f"  [{i+1}] {name}: ❌ missing signals or coldEmail")
                if not has_signals:
                    print(f"       - buyingSignals: {item.get('buyingSignals', 'missing')}")
                if not has_email:
                    print(f"       - coldEmail: {len(item.get('coldEmail', ''))} chars")
        
        print(f"\nSummary: {success_count}/3 successfully enriched")
        
        # All 3 should be enriched
        if success_count < 3:
            print(f"❌ FAIL: Expected all 3 enriched, got {success_count}")
            return False
        
        print(f"✓ All 3 rows enriched with buyingSignals + coldEmail")
        print(f"\n✅ TEST PASSED")
        print(f"Response time: {elapsed:.2f}s")
        return True
        
    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"❌ FAIL: Request timed out after {elapsed:.2f} seconds")
        return False
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ FAIL: Exception after {elapsed:.2f} seconds: {str(e)}")
        return False


def main():
    print("\n" + "="*80)
    print("BUG FIX VERIFICATION TEST")
    print("Testing sequential processing with retry logic for LLM endpoints")
    print("="*80)
    
    results = []
    
    # Test 1: Bulk outreach with 8 leads
    test1_pass = test_bulk_outreach()
    results.append(("POST /api/outreach/bulk (8 leads)", test1_pass))
    
    # Test 2: CSV import with 3 rows
    test2_pass = test_csv_import()
    results.append(("POST /api/import/csv (3 rows)", test2_pass))
    
    # Final summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Bug fix verified!")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit(main())
