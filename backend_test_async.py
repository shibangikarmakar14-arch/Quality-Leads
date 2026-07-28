#!/usr/bin/env python3
"""
Backend test for async bulk outreach job pattern fix.
Tests the fix for 60s gateway timeout issue.
"""

import requests
import time
import json

BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

def test_bulk_outreach_8_leads():
    """
    Test 1: POST /api/outreach/bulk with 8 leads
    - Should return 200 in UNDER 5 seconds
    - Response must be { jobId: "<uuid>", total: 8 }
    """
    print("\n" + "="*80)
    print("TEST 1: POST /api/outreach/bulk with 8 leads")
    print("="*80)
    
    payload = {
        "leadIds": [
            "lead_001", "lead_002", "lead_003", "lead_004",
            "lead_005", "lead_006", "lead_007", "lead_008"
        ],
        "type": "cold_email",
        "tone": "consultative"
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/outreach/bulk", json=payload, timeout=10)
        elapsed = time.time() - start_time
        
        print(f"✓ Status Code: {response.status_code}")
        print(f"✓ Response Time: {elapsed:.2f}s")
        
        if response.status_code != 200:
            print(f"✗ FAIL: Expected 200, got {response.status_code}")
            print(f"  Response: {response.text}")
            return None
        
        if elapsed >= 5.0:
            print(f"✗ FAIL: Response took {elapsed:.2f}s (should be < 5s)")
            return None
        
        data = response.json()
        print(f"✓ Response: {json.dumps(data, indent=2)}")
        
        if "jobId" not in data:
            print("✗ FAIL: Missing 'jobId' in response")
            return None
        
        if data.get("total") != 8:
            print(f"✗ FAIL: Expected total=8, got {data.get('total')}")
            return None
        
        print(f"✅ TEST 1 PASSED: Returned 200 in {elapsed:.2f}s with jobId={data['jobId']}, total=8")
        return data["jobId"]
        
    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"✗ FAIL: Request timed out after {elapsed:.2f}s")
        return None
    except Exception as e:
        print(f"✗ FAIL: Exception: {e}")
        return None


def test_poll_job_status(job_id):
    """
    Test 2: GET /api/bulk/<jobId> - poll every 3 seconds up to 3 minutes
    - Response: { jobId, status: "running"|"done"|"error", total, done, results, error? }
    - Verify `done` counter grows from 0 → 8 over time
    - Verify eventually status becomes "done"
    - Verify final results.length === 8
    - Verify at least 7/8 results have non-empty `content` (>100 chars)
    - Verify no HTTP 502
    """
    print("\n" + "="*80)
    print(f"TEST 2: GET /api/bulk/{job_id} - Polling for completion")
    print("="*80)
    
    max_polls = 60  # 3 minutes / 3 seconds = 60 polls
    poll_interval = 3
    start_time = time.time()
    
    done_values = []
    
    for poll_num in range(1, max_polls + 1):
        try:
            response = requests.get(f"{BASE_URL}/bulk/{job_id}", timeout=10)
            elapsed = time.time() - start_time
            
            if response.status_code == 502:
                print(f"✗ FAIL: Got HTTP 502 (gateway timeout)")
                return False
            
            if response.status_code != 200:
                print(f"✗ FAIL: Expected 200, got {response.status_code}")
                print(f"  Response: {response.text}")
                return False
            
            data = response.json()
            status = data.get("status")
            done = data.get("done", 0)
            total = data.get("total", 0)
            results = data.get("results", [])
            
            done_values.append(done)
            
            print(f"Poll {poll_num} ({elapsed:.1f}s): status={status}, done={done}/{total}, results={len(results)}")
            
            if status == "done":
                print(f"\n✓ Job completed in {elapsed:.1f}s")
                print(f"✓ Done counter progression: {done_values}")
                
                # Verify done counter grew from 0 to 8
                if done_values[0] == 0 and done_values[-1] == 8:
                    print(f"✓ Done counter grew from 0 → 8")
                else:
                    print(f"⚠ Warning: Done counter progression unexpected: {done_values}")
                
                # Verify results.length === 8
                if len(results) != 8:
                    print(f"✗ FAIL: Expected 8 results, got {len(results)}")
                    return False
                print(f"✓ Results length: {len(results)}")
                
                # Verify at least 7/8 have content > 100 chars
                valid_results = 0
                error_results = 0
                for i, result in enumerate(results):
                    content = result.get("content", "")
                    error = result.get("error")
                    if content and len(content) > 100:
                        valid_results += 1
                        print(f"  Result {i+1}: ✓ content={len(content)} chars")
                    elif error:
                        error_results += 1
                        print(f"  Result {i+1}: ✗ error={error}")
                    else:
                        print(f"  Result {i+1}: ✗ content={len(content)} chars (< 100)")
                
                if valid_results >= 7:
                    print(f"✓ Valid results: {valid_results}/8 (>= 7 required)")
                else:
                    print(f"✗ FAIL: Only {valid_results}/8 valid results (need >= 7)")
                    return False
                
                if error_results <= 1:
                    print(f"✓ Error results: {error_results}/8 (<= 1 allowed)")
                else:
                    print(f"⚠ Warning: {error_results}/8 results have errors")
                
                print(f"✅ TEST 2 PASSED: Job completed successfully with {valid_results}/8 valid results")
                return True
            
            elif status == "error":
                print(f"✗ FAIL: Job failed with error: {data.get('error')}")
                return False
            
            # Still running, wait before next poll
            time.sleep(poll_interval)
            
        except Exception as e:
            print(f"✗ FAIL: Exception during polling: {e}")
            return False
    
    print(f"✗ FAIL: Job did not complete within 3 minutes")
    return False


def test_job_not_found():
    """
    Test 3: GET /api/bulk/does-not-exist → 404
    """
    print("\n" + "="*80)
    print("TEST 3: GET /api/bulk/does-not-exist")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/bulk/does-not-exist", timeout=10)
        
        print(f"✓ Status Code: {response.status_code}")
        
        if response.status_code != 404:
            print(f"✗ FAIL: Expected 404, got {response.status_code}")
            return False
        
        print(f"✅ TEST 3 PASSED: Returns 404 for non-existent job")
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception: {e}")
        return False


def test_csv_import_5_rows():
    """
    Test 4: POST /api/import/csv with 5 rows
    - Expect HTTP 200 in UNDER 5 seconds
    - Response { jobId, total: 5 }
    - Poll GET /api/bulk/<jobId>
    - Final should have status="done", results.length===5
    - At least 4/5 rows should have buyingSignals array (length >= 3) AND coldEmail string (>100 chars)
    """
    print("\n" + "="*80)
    print("TEST 4: POST /api/import/csv with 5 rows")
    print("="*80)
    
    payload = {
        "rows": [
            {"name": "Alice", "title": "CRO", "company": "TestCorp", "industry": "SaaS", "location": "NYC"},
            {"name": "Bob", "title": "CTO", "company": "BuildCo", "industry": "Devtools", "location": "SF"},
            {"name": "Cara", "title": "VP Sales", "company": "GrowInc", "industry": "Fintech", "location": "London"},
            {"name": "Dan", "title": "Head of Growth", "company": "ScaleUp", "industry": "MarTech", "location": "Berlin"},
            {"name": "Eve", "title": "Founder", "company": "Startuppy", "industry": "AI", "location": "Toronto"}
        ]
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/import/csv", json=payload, timeout=10)
        elapsed = time.time() - start_time
        
        print(f"✓ Status Code: {response.status_code}")
        print(f"✓ Response Time: {elapsed:.2f}s")
        
        if response.status_code != 200:
            print(f"✗ FAIL: Expected 200, got {response.status_code}")
            print(f"  Response: {response.text}")
            return False
        
        if elapsed >= 5.0:
            print(f"✗ FAIL: Response took {elapsed:.2f}s (should be < 5s)")
            return False
        
        data = response.json()
        print(f"✓ Response: {json.dumps(data, indent=2)}")
        
        if "jobId" not in data:
            print("✗ FAIL: Missing 'jobId' in response")
            return False
        
        if data.get("total") != 5:
            print(f"✗ FAIL: Expected total=5, got {data.get('total')}")
            return False
        
        job_id = data["jobId"]
        print(f"✓ Returned 200 in {elapsed:.2f}s with jobId={job_id}, total=5")
        
        # Poll for completion
        print(f"\nPolling job {job_id} for completion...")
        max_polls = 60
        poll_interval = 3
        
        for poll_num in range(1, max_polls + 1):
            response = requests.get(f"{BASE_URL}/bulk/{job_id}", timeout=10)
            
            if response.status_code != 200:
                print(f"✗ FAIL: Poll returned {response.status_code}")
                return False
            
            data = response.json()
            status = data.get("status")
            done = data.get("done", 0)
            total = data.get("total", 0)
            results = data.get("results", [])
            
            elapsed = time.time() - start_time
            print(f"Poll {poll_num} ({elapsed:.1f}s): status={status}, done={done}/{total}")
            
            if status == "done":
                print(f"\n✓ CSV import completed in {elapsed:.1f}s")
                
                # Verify results.length === 5
                if len(results) != 5:
                    print(f"✗ FAIL: Expected 5 results, got {len(results)}")
                    return False
                print(f"✓ Results length: {len(results)}")
                
                # Verify at least 4/5 have buyingSignals (>= 3) and coldEmail (> 100 chars)
                valid_results = 0
                for i, result in enumerate(results):
                    buying_signals = result.get("buyingSignals", [])
                    cold_email = result.get("coldEmail", "")
                    error = result.get("error")
                    
                    if error:
                        print(f"  Row {i+1} ({result.get('name')}): ✗ error={error}")
                    elif len(buying_signals) >= 3 and len(cold_email) > 100:
                        valid_results += 1
                        print(f"  Row {i+1} ({result.get('name')}): ✓ signals={len(buying_signals)}, email={len(cold_email)} chars")
                    else:
                        print(f"  Row {i+1} ({result.get('name')}): ✗ signals={len(buying_signals)}, email={len(cold_email)} chars")
                
                if valid_results >= 4:
                    print(f"✓ Valid results: {valid_results}/5 (>= 4 required)")
                    print(f"✅ TEST 4 PASSED: CSV import completed with {valid_results}/5 valid enrichments")
                    return True
                else:
                    print(f"✗ FAIL: Only {valid_results}/5 valid results (need >= 4)")
                    return False
            
            elif status == "error":
                print(f"✗ FAIL: Job failed with error: {data.get('error')}")
                return False
            
            time.sleep(poll_interval)
        
        print(f"✗ FAIL: CSV import did not complete within 3 minutes")
        return False
        
    except Exception as e:
        print(f"✗ FAIL: Exception: {e}")
        return False


def main():
    print("\n" + "="*80)
    print("ASYNC BULK OUTREACH JOB PATTERN - BUG FIX VERIFICATION")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Testing async job pattern fix for 60s gateway timeout issue")
    print("="*80)
    
    results = {}
    
    # Test 1: POST /api/outreach/bulk with 8 leads
    job_id = test_bulk_outreach_8_leads()
    results["test1_bulk_outreach_immediate_response"] = job_id is not None
    
    # Test 2: Poll job status
    if job_id:
        results["test2_poll_job_completion"] = test_poll_job_status(job_id)
    else:
        print("\n⚠ Skipping Test 2 (no jobId from Test 1)")
        results["test2_poll_job_completion"] = False
    
    # Test 3: Job not found
    results["test3_job_not_found_404"] = test_job_not_found()
    
    # Test 4: CSV import
    results["test4_csv_import_async"] = test_csv_import_5_rows()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_flag in results.items():
        status = "✅ PASS" if passed_flag else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("="*80)
    print(f"OVERALL: {passed}/{total} tests passed")
    print("="*80)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Async job pattern fix verified successfully!")
        print("   - Bulk outreach returns immediately (< 5s)")
        print("   - Background processing works correctly")
        print("   - No more 60s gateway timeouts")
        print("   - Polling endpoint provides real-time progress")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed - see details above")
        return 1


if __name__ == "__main__":
    exit(main())
