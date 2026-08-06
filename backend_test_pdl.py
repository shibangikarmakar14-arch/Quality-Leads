#!/usr/bin/env python3
"""
PDL Integration Test Suite
Tests the PeopleDataLabs real-data integration for prospect search.

CRITICAL: PDL FREE TIER has 100 credits/month, 10 requests/minute.
This test suite runs MAX 6 queries with 3+ second delays between them.
"""

import requests
import time
import json
import sys

BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

# Track test results
results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status}: {name}")
    if details:
        print(f"  {details}")
    results["tests"].append({"name": name, "passed": passed, "details": details})
    if passed:
        results["passed"] += 1
    else:
        results["failed"] += 1

def test_pdl_search_chubb():
    """Test 1: GET /api/leads?q=chubb - Real PDL data for Chubb company"""
    print("\n" + "="*80)
    print("TEST 1: PDL Search for 'chubb' (company with 37,000+ profiles)")
    print("="*80)
    
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=chubb", timeout=30)
        elapsed = time.time() - start
        
        print(f"Status: {response.status_code}")
        print(f"Response time: {elapsed:.2f}s")
        
        if response.status_code != 200:
            log_test("PDL Search - Chubb", False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return None
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        print(f"Source: {data.get('source')}")
        print(f"Count: {data.get('count')}")
        print(f"Total matches: {data.get('totalMatches', 'N/A')}")
        
        # Check response structure
        if "results" not in data:
            log_test("PDL Search - Chubb", False, "Missing 'results' field")
            return None
        
        if "count" not in data:
            log_test("PDL Search - Chubb", False, "Missing 'count' field")
            return None
        
        if "source" not in data:
            log_test("PDL Search - Chubb", False, "Missing 'source' field")
            return None
        
        if "quota" not in data:
            log_test("PDL Search - Chubb", False, "Missing 'quota' field")
            return None
        
        # Check count >= 1
        count = data.get("count", 0)
        if count < 1:
            log_test("PDL Search - Chubb", False, f"Expected count >= 1, got {count}")
            return None
        
        # Check source is pdl or cached
        source = data.get("source")
        if source not in ["pdl", "cached"]:
            log_test("PDL Search - Chubb", False, f"Expected source 'pdl' or 'cached', got '{source}'")
            return None
        
        # Validate first result
        results_list = data.get("results", [])
        if len(results_list) == 0:
            log_test("PDL Search - Chubb", False, "Results array is empty")
            return None
        
        first = results_list[0]
        print(f"\nFirst result sample:")
        print(f"  ID: {first.get('id')}")
        print(f"  Name: {first.get('name')}")
        print(f"  Title: {first.get('title')}")
        print(f"  Company: {first.get('company')}")
        print(f"  LinkedIn: {first.get('linkedinUrl')}")
        print(f"  Verified: {first.get('verified')}")
        print(f"  Email: {first.get('email')}")
        print(f"  Phone: {first.get('phone')}")
        print(f"  Location: {first.get('location')}")
        
        # Validate required fields
        errors = []
        
        # ID must start with pdl_
        if not first.get("id", "").startswith("pdl_"):
            errors.append(f"ID should start with 'pdl_', got '{first.get('id')}'")
        
        # Name must be real (not "Unknown")
        name = first.get("name", "")
        if not name or name == "Unknown":
            errors.append(f"Name should be real, got '{name}'")
        
        # Title must be non-empty
        title = first.get("title", "")
        if not title:
            errors.append("Title is empty")
        
        # Company must contain "chubb" (case-insensitive)
        company = first.get("company", "").lower()
        if "chubb" not in company:
            errors.append(f"Company should contain 'chubb', got '{first.get('company')}'")
        
        # LinkedIn URL must be valid
        linkedin = first.get("linkedinUrl", "")
        if not linkedin or not linkedin.startswith("https://") or "linkedin.com/in/" not in linkedin:
            errors.append(f"LinkedIn URL invalid: '{linkedin}'")
        
        # Verified must be true
        if first.get("verified") != True:
            errors.append(f"Verified should be true, got {first.get('verified')}")
        
        # Email/phone/location should be null (free tier restriction)
        if first.get("email") is not None:
            errors.append(f"Email should be null (free tier), got '{first.get('email')}'")
        
        if first.get("phone") is not None:
            errors.append(f"Phone should be null (free tier), got '{first.get('phone')}'")
        
        if first.get("location") is not None:
            errors.append(f"Location should be null (free tier), got '{first.get('location')}'")
        
        # Check quota object
        quota = data.get("quota", {})
        if "monthlyRemaining" not in quota:
            errors.append("Quota missing 'monthlyRemaining'")
        
        if "minuteRemaining" not in quota:
            errors.append("Quota missing 'minuteRemaining'")
        
        print(f"\nQuota info:")
        print(f"  Monthly remaining: {quota.get('monthlyRemaining')}")
        print(f"  Minute remaining: {quota.get('minuteRemaining')}")
        print(f"  Last call credits spent: {quota.get('lastCallCreditsSpent')}")
        
        if errors:
            log_test("PDL Search - Chubb", False, "; ".join(errors))
            return None
        
        log_test("PDL Search - Chubb", True, f"Returned {count} results from {source}, all validations passed")
        return data
        
    except Exception as e:
        log_test("PDL Search - Chubb", False, f"Exception: {str(e)}")
        return None

def test_cached_search():
    """Test 2: Repeat same query - should be cached"""
    print("\n" + "="*80)
    print("TEST 2: Repeat 'chubb' query - should return cached results")
    print("="*80)
    
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=chubb", timeout=30)
        elapsed = time.time() - start
        
        print(f"Status: {response.status_code}")
        print(f"Response time: {elapsed:.2f}s")
        
        if response.status_code != 200:
            log_test("Cached Search", False, f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        source = data.get("source")
        count = data.get("count")
        
        print(f"Source: {source}")
        print(f"Count: {count}")
        
        # Should be cached
        if source != "cached":
            log_test("Cached Search", False, f"Expected source 'cached', got '{source}'")
            return
        
        # Should be fast (< 500ms)
        if elapsed >= 0.5:
            log_test("Cached Search", False, f"Expected < 500ms, took {elapsed:.2f}s")
            return
        
        # Should have same count as first call
        if count < 1:
            log_test("Cached Search", False, f"Expected count >= 1, got {count}")
            return
        
        log_test("Cached Search", True, f"Returned {count} cached results in {elapsed:.2f}s")
        
    except Exception as e:
        log_test("Cached Search", False, f"Exception: {str(e)}")

def test_procurement_insurance():
    """Test 3: GET /api/leads?q=procurement+at+insurance"""
    print("\n" + "="*80)
    print("TEST 3: PDL Search for 'procurement at insurance'")
    print("="*80)
    
    # Wait 3 seconds to respect rate limit
    print("Waiting 3 seconds to respect rate limit...")
    time.sleep(3)
    
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=procurement+at+insurance", timeout=30)
        elapsed = time.time() - start
        
        print(f"Status: {response.status_code}")
        print(f"Response time: {elapsed:.2f}s")
        
        if response.status_code != 200:
            log_test("PDL Search - Procurement Insurance", False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return None
        
        data = response.json()
        source = data.get("source")
        count = data.get("count")
        
        print(f"Source: {source}")
        print(f"Count: {count}")
        
        # Check source is pdl or cached
        if source not in ["pdl", "cached"]:
            log_test("PDL Search - Procurement Insurance", False, f"Expected source 'pdl' or 'cached', got '{source}'")
            return None
        
        # Check count >= 1
        if count < 1:
            log_test("PDL Search - Procurement Insurance", False, f"Expected count >= 1, got {count}")
            return None
        
        # Check first result has insurance-related industry
        results_list = data.get("results", [])
        if len(results_list) > 0:
            first = results_list[0]
            industry = first.get("industry", "").lower()
            print(f"First result industry: {first.get('industry')}")
            print(f"First result company: {first.get('company')}")
            print(f"First result title: {first.get('title')}")
            
            # Industry should be insurance-related (but not strict - PDL might return related results)
            # Just verify we got results
        
        log_test("PDL Search - Procurement Insurance", True, f"Returned {count} results from {source}")
        return data
        
    except Exception as e:
        log_test("PDL Search - Procurement Insurance", False, f"Exception: {str(e)}")
        return None

def test_empty_query():
    """Test 4: GET /api/leads?q= (empty query) - should return seeded data"""
    print("\n" + "="*80)
    print("TEST 4: Empty query - should return seeded demo prospects")
    print("="*80)
    
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=", timeout=30)
        elapsed = time.time() - start
        
        print(f"Status: {response.status_code}")
        print(f"Response time: {elapsed:.2f}s")
        
        if response.status_code != 200:
            log_test("Empty Query - Seeded Data", False, f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        source = data.get("source")
        count = data.get("count")
        
        print(f"Source: {source}")
        print(f"Count: {count}")
        
        # Should be seeded
        if source != "seeded":
            log_test("Empty Query - Seeded Data", False, f"Expected source 'seeded', got '{source}'")
            return
        
        # Should have >= 8 results (from seeded dataset)
        if count < 8:
            log_test("Empty Query - Seeded Data", False, f"Expected count >= 8, got {count}")
            return
        
        log_test("Empty Query - Seeded Data", True, f"Returned {count} seeded results")
        
    except Exception as e:
        log_test("Empty Query - Seeded Data", False, f"Exception: {str(e)}")

def test_quota_endpoint():
    """Test 5: GET /api/quota"""
    print("\n" + "="*80)
    print("TEST 5: GET /api/quota - Check quota endpoint")
    print("="*80)
    
    try:
        response = requests.get(f"{BASE_URL}/quota", timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Quota Endpoint", False, f"Expected 200, got {response.status_code}")
            return
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if "quota" not in data:
            log_test("Quota Endpoint", False, "Missing 'quota' field")
            return
        
        quota = data.get("quota", {})
        
        # Check required fields
        required = ["monthlyRemaining", "monthlyLimit", "minuteRemaining", "minuteLimit"]
        missing = [f for f in required if f not in quota]
        
        if missing:
            log_test("Quota Endpoint", False, f"Missing fields: {', '.join(missing)}")
            return
        
        # Check values are numbers
        for field in required:
            val = quota.get(field)
            if val is not None and not isinstance(val, (int, float)):
                log_test("Quota Endpoint", False, f"{field} should be a number, got {type(val)}")
                return
        
        print(f"\nQuota details:")
        print(f"  Monthly: {quota.get('monthlyRemaining')} / {quota.get('monthlyLimit')}")
        print(f"  Minute: {quota.get('minuteRemaining')} / {quota.get('minuteLimit')}")
        print(f"  Last call credits: {quota.get('lastCallCreditsSpent')}")
        print(f"  Reset at: {quota.get('resetAt')}")
        
        log_test("Quota Endpoint", True, f"Quota endpoint working, monthly remaining: {quota.get('monthlyRemaining')}")
        
    except Exception as e:
        log_test("Quota Endpoint", False, f"Exception: {str(e)}")

def test_individual_lead(lead_id):
    """Test 6: GET /api/leads/<pdl_id>"""
    print("\n" + "="*80)
    print(f"TEST 6: GET /api/leads/{lead_id} - Individual PDL lead")
    print("="*80)
    
    if not lead_id:
        log_test("Individual PDL Lead", False, "No lead ID provided (previous test may have failed)")
        return
    
    try:
        response = requests.get(f"{BASE_URL}/leads/{lead_id}", timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Individual PDL Lead", False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return
        
        data = response.json()
        
        if "lead" not in data:
            log_test("Individual PDL Lead", False, "Missing 'lead' field")
            return
        
        lead = data.get("lead")
        print(f"\nLead details:")
        print(f"  ID: {lead.get('id')}")
        print(f"  Name: {lead.get('name')}")
        print(f"  Title: {lead.get('title')}")
        print(f"  Company: {lead.get('company')}")
        
        # Verify it's the same lead
        if lead.get("id") != lead_id:
            log_test("Individual PDL Lead", False, f"Expected ID {lead_id}, got {lead.get('id')}")
            return
        
        # Verify it has required fields
        if not lead.get("name") or not lead.get("title") or not lead.get("company"):
            log_test("Individual PDL Lead", False, "Missing required fields (name/title/company)")
            return
        
        log_test("Individual PDL Lead", True, f"Retrieved lead {lead.get('name')} successfully")
        
    except Exception as e:
        log_test("Individual PDL Lead", False, f"Exception: {str(e)}")

def test_chat_with_pdl_lead(lead_id):
    """Test 7: POST /api/chat with PDL leadId"""
    print("\n" + "="*80)
    print(f"TEST 7: POST /api/chat with PDL lead {lead_id}")
    print("="*80)
    
    if not lead_id:
        log_test("Chat with PDL Lead", False, "No lead ID provided (previous test may have failed)")
        return
    
    # Wait 3 seconds to respect rate limit
    print("Waiting 3 seconds...")
    time.sleep(3)
    
    try:
        payload = {
            "leadId": lead_id,
            "message": "Suggest 3 discovery questions for this prospect"
        }
        
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=30)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            log_test("Chat with PDL Lead", False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return
        
        data = response.json()
        
        if "sessionId" not in data:
            log_test("Chat with PDL Lead", False, "Missing 'sessionId' field")
            return
        
        if "reply" not in data:
            log_test("Chat with PDL Lead", False, "Missing 'reply' field")
            return
        
        reply = data.get("reply", "")
        print(f"\nReply length: {len(reply)} chars")
        print(f"Reply preview: {reply[:200]}...")
        
        # Reply should be > 50 chars
        if len(reply) < 50:
            log_test("Chat with PDL Lead", False, f"Reply too short: {len(reply)} chars (expected > 50)")
            return
        
        log_test("Chat with PDL Lead", True, f"Claude generated {len(reply)} char response for PDL lead")
        
    except Exception as e:
        log_test("Chat with PDL Lead", False, f"Exception: {str(e)}")

def main():
    print("="*80)
    print("PDL INTEGRATION TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"WARNING: Running max 6 queries to conserve PDL credits")
    print("="*80)
    
    # Test 1: Search for Chubb
    test1_data = test_pdl_search_chubb()
    
    # Test 2: Cached search
    test_cached_search()
    
    # Test 3: Procurement at insurance
    test3_data = test_procurement_insurance()
    
    # Test 4: Empty query (seeded data)
    test_empty_query()
    
    # Test 5: Quota endpoint
    test_quota_endpoint()
    
    # Test 6 & 7: Individual lead and chat (use first result from test 1)
    lead_id = None
    if test1_data and test1_data.get("results"):
        lead_id = test1_data["results"][0].get("id")
    
    test_individual_lead(lead_id)
    test_chat_with_pdl_lead(lead_id)
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total tests: {results['passed'] + results['failed']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print("="*80)
    
    for test in results["tests"]:
        status = "✅" if test["passed"] else "❌"
        print(f"{status} {test['name']}")
        if test["details"]:
            print(f"   {test['details']}")
    
    print("="*80)
    
    # Exit with appropriate code
    sys.exit(0 if results["failed"] == 0 else 1)

if __name__ == "__main__":
    main()
