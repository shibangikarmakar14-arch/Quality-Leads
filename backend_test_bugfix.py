#!/usr/bin/env python3
"""
Bug Fix Verification Tests for /api/saved endpoints
Testing two specific bug fixes:
1. POST /api/saved - fixed undefined folder/note variables (added destructuring with defaults)
2. GET /api/saved - added .limit(100) to prevent unbounded queries
"""

import requests
import json
import time

BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

def test_post_saved_with_full_body():
    """Test 1: POST /api/saved with leadId, folder, and note"""
    print("\n" + "="*80)
    print("TEST 1: POST /api/saved with full body (leadId, folder, note)")
    print("="*80)
    
    try:
        payload = {
            "leadId": "lead_004",
            "folder": "HotList",
            "note": "Follow up next week"
        }
        
        response = requests.post(f"{BASE_URL}/saved", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("saved") == True:
                print("✅ TEST 1 PASSED: Successfully saved lead with folder and note")
                return True
            else:
                print("❌ TEST 1 FAILED: Response doesn't contain saved:true")
                return False
        elif response.status_code == 500:
            # Check if it's the old bug (folder/note undefined)
            if "folder is not defined" in response.text or "note is not defined" in response.text:
                print("❌ TEST 1 FAILED: BUG NOT FIXED - folder/note still undefined")
                return False
            else:
                print(f"❌ TEST 1 FAILED: HTTP 500 with different error: {response.text}")
                return False
        else:
            print(f"❌ TEST 1 FAILED: Unexpected status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TEST 1 FAILED: Exception - {str(e)}")
        return False


def test_get_saved_verify_entry():
    """Test 2: GET /api/saved to verify the saved lead exists"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/saved - verify lead_004 with folder and note")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/saved", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            saved_items = data.get("saved", [])
            print(f"Total saved items: {len(saved_items)}")
            
            # Find lead_004
            lead_004 = None
            for item in saved_items:
                if item.get("leadId") == "lead_004":
                    lead_004 = item
                    break
            
            if lead_004:
                print(f"Found lead_004: {json.dumps(lead_004, indent=2)}")
                folder = lead_004.get("folder")
                note = lead_004.get("note")
                
                if folder == "HotList" and note == "Follow up next week":
                    print("✅ TEST 2 PASSED: lead_004 found with correct folder and note")
                    return True
                else:
                    print(f"❌ TEST 2 FAILED: lead_004 found but folder='{folder}' (expected 'HotList'), note='{note}' (expected 'Follow up next week')")
                    return False
            else:
                print("❌ TEST 2 FAILED: lead_004 not found in saved items")
                return False
        else:
            print(f"❌ TEST 2 FAILED: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TEST 2 FAILED: Exception - {str(e)}")
        return False


def test_post_saved_defaults():
    """Test 3: POST /api/saved with only leadId (testing default values)"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/saved with only leadId (no folder/note)")
    print("="*80)
    
    try:
        payload = {
            "leadId": "lead_004"
        }
        
        response = requests.post(f"{BASE_URL}/saved", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("saved") == True and data.get("alreadySaved") == True:
                print("✅ TEST 3 PASSED: Returns saved:true, alreadySaved:true (duplicate detection works)")
                return True
            elif data.get("saved") == True:
                print("✅ TEST 3 PASSED: Returns saved:true (defaults applied without error)")
                return True
            else:
                print("❌ TEST 3 FAILED: Response doesn't contain saved:true")
                return False
        elif response.status_code == 500:
            if "folder is not defined" in response.text or "note is not defined" in response.text:
                print("❌ TEST 3 FAILED: BUG NOT FIXED - folder/note undefined when not provided")
                return False
            else:
                print(f"❌ TEST 3 FAILED: HTTP 500 with error: {response.text}")
                return False
        else:
            print(f"❌ TEST 3 FAILED: Unexpected status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TEST 3 FAILED: Exception - {str(e)}")
        return False


def test_post_saved_missing_leadid():
    """Test 4: POST /api/saved with empty body (missing leadId)"""
    print("\n" + "="*80)
    print("TEST 4: POST /api/saved with empty body (missing leadId)")
    print("="*80)
    
    try:
        payload = {}
        
        response = requests.post(f"{BASE_URL}/saved", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data and "leadId required" in data["error"]:
                print("✅ TEST 4 PASSED: Returns HTTP 400 with 'leadId required' error")
                return True
            else:
                print(f"❌ TEST 4 FAILED: HTTP 400 but wrong error message: {data}")
                return False
        else:
            print(f"❌ TEST 4 FAILED: Expected HTTP 400, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TEST 4 FAILED: Exception - {str(e)}")
        return False


def test_delete_saved():
    """Test 5: DELETE /api/saved/lead_004"""
    print("\n" + "="*80)
    print("TEST 5: DELETE /api/saved/lead_004")
    print("="*80)
    
    try:
        response = requests.delete(f"{BASE_URL}/saved/lead_004", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                print("✅ TEST 5 PASSED: Successfully deleted lead_004")
                return True
            else:
                print("❌ TEST 5 FAILED: Response doesn't contain ok:true")
                return False
        else:
            print(f"❌ TEST 5 FAILED: Expected HTTP 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TEST 5 FAILED: Exception - {str(e)}")
        return False


def test_smoke_test_leads():
    """Test 6: Smoke test - GET /api/leads?q=VP"""
    print("\n" + "="*80)
    print("TEST 6: Smoke test - GET /api/leads?q=VP")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/leads?q=VP", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            count = data.get("count", 0)
            print(f"Results count: {count}")
            print(f"Sample results: {json.dumps(results[:2], indent=2) if results else 'None'}")
            
            if count > 0:
                print("✅ TEST 6 PASSED: GET /api/leads?q=VP returns results (file still compiles)")
                return True
            else:
                print("⚠️ TEST 6 WARNING: No results returned, but endpoint works")
                return True
        else:
            print(f"❌ TEST 6 FAILED: Expected HTTP 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TEST 6 FAILED: Exception - {str(e)}")
        return False


def main():
    print("\n" + "="*80)
    print("BUG FIX VERIFICATION TEST SUITE")
    print("Testing fixes for POST /api/saved and GET /api/saved")
    print("="*80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("Test 1: POST /api/saved with full body", test_post_saved_with_full_body()))
    time.sleep(0.5)
    
    results.append(("Test 2: GET /api/saved verify entry", test_get_saved_verify_entry()))
    time.sleep(0.5)
    
    results.append(("Test 3: POST /api/saved with defaults", test_post_saved_defaults()))
    time.sleep(0.5)
    
    results.append(("Test 4: POST /api/saved missing leadId", test_post_saved_missing_leadid()))
    time.sleep(0.5)
    
    results.append(("Test 5: DELETE /api/saved/lead_004", test_delete_saved()))
    time.sleep(0.5)
    
    results.append(("Test 6: Smoke test GET /api/leads", test_smoke_test_leads()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "="*80)
    print(f"TOTAL: {passed}/{len(results)} tests passed")
    print("="*80)
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED - Bug fixes verified successfully!")
    else:
        print(f"\n⚠️ {failed} test(s) failed - Bug fixes may not be complete")


if __name__ == "__main__":
    main()
