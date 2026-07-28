#!/usr/bin/env python3
"""
Bug Fix Verification: AI-Generated Leads for Queries with No Seeded Matches
Tests the feature where queries with no seeded matches trigger Claude to generate 6 realistic prospects
"""

import requests
import json
import time
import sys

# Base URL from environment
BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

# Test configuration
TIMEOUT = 95  # 95 seconds timeout for LLM generation (review request says up to 90s)
TEST_RESULTS = []
GENERATED_LEAD_ID = None

def log_test(test_name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    print(result)
    TEST_RESULTS.append({"test": test_name, "passed": passed, "message": message})
    return passed

def test_1_generate_google_query():
    """Test 1: GET /api/leads?q=procurement+manager+at+google (first time, should generate)"""
    global GENERATED_LEAD_ID
    
    print("\n🔍 Test 1: First query 'procurement manager at google' (may take up to 90s)...")
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=procurement+manager+at+google", timeout=TIMEOUT)
        elapsed = time.time() - start_time
        
        print(f"   Response received in {elapsed:.1f}s")
        
        if response.status_code != 200:
            return log_test("Test 1: Generate Google query", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Check response structure
        if "results" not in data or "count" not in data or "source" not in data:
            return log_test("Test 1: Generate Google query", False, "Missing 'results', 'count', or 'source' in response")
        
        # Check source is "generated" or "cached"
        if data["source"] not in ["generated", "cached"]:
            return log_test("Test 1: Generate Google query", False, f"Expected source 'generated' or 'cached', got '{data['source']}'")
        
        # Check count is 6
        if data["count"] != 6:
            return log_test("Test 1: Generate Google query", False, f"Expected count 6, got {data['count']}")
        
        # Check results length
        if len(data["results"]) != 6:
            return log_test("Test 1: Generate Google query", False, f"Expected 6 results, got {len(data['results'])}")
        
        # Validate each result
        for i, result in enumerate(data["results"]):
            # Check id starts with gen_
            if not result.get("id", "").startswith("gen_"):
                return log_test("Test 1: Generate Google query", False, f"Result {i} id doesn't start with 'gen_': {result.get('id')}")
            
            # Check required fields
            required_fields = ["name", "title", "company", "location", "industry", "seniority", "department", "buyingSignals", "companyDetails", "avatar"]
            missing = [f for f in required_fields if f not in result]
            if missing:
                return log_test("Test 1: Generate Google query", False, f"Result {i} missing fields: {missing}")
            
            # Check name and title are not null/empty
            if not result.get("name") or not result.get("title"):
                return log_test("Test 1: Generate Google query", False, f"Result {i} has null/empty name or title")
            
            # Check company contains Google (case-insensitive)
            if "google" not in result.get("company", "").lower():
                return log_test("Test 1: Generate Google query", False, f"Result {i} company doesn't contain 'Google': {result.get('company')}")
            
            # Check buyingSignals is array with at least 2 items
            buying_signals = result.get("buyingSignals", [])
            if not isinstance(buying_signals, list) or len(buying_signals) < 2:
                return log_test("Test 1: Generate Google query", False, f"Result {i} buyingSignals must be array with >= 2 items, got {len(buying_signals)}")
            
            # Check companyDetails structure
            company_details = result.get("companyDetails", {})
            if not company_details.get("name"):
                return log_test("Test 1: Generate Google query", False, f"Result {i} companyDetails.name is missing")
            
            tech_stack = company_details.get("techStack", [])
            if not isinstance(tech_stack, list):
                return log_test("Test 1: Generate Google query", False, f"Result {i} companyDetails.techStack must be array")
            
            # Check avatar is URL string
            avatar = result.get("avatar", "")
            if not isinstance(avatar, str) or not avatar.startswith("http"):
                return log_test("Test 1: Generate Google query", False, f"Result {i} avatar must be URL string")
        
        # Store first generated lead ID for later tests
        GENERATED_LEAD_ID = data["results"][0]["id"]
        
        return log_test("Test 1: Generate Google query", True, f"Generated 6 leads in {elapsed:.1f}s, source: {data['source']}, first ID: {GENERATED_LEAD_ID}")
    
    except requests.exceptions.Timeout:
        return log_test("Test 1: Generate Google query", False, f"Request timed out after {TIMEOUT}s")
    except Exception as e:
        return log_test("Test 1: Generate Google query", False, f"Exception: {str(e)}")

def test_2_cached_google_query():
    """Test 2: Same query again (should be cached and fast)"""
    print("\n🔍 Test 2: Re-run same query 'procurement manager at google' (should be cached)...")
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=procurement+manager+at+google", timeout=10)
        elapsed = time.time() - start_time
        
        print(f"   Response received in {elapsed:.1f}s")
        
        if response.status_code != 200:
            return log_test("Test 2: Cached Google query", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Check source is "cached"
        if data["source"] != "cached":
            return log_test("Test 2: Cached Google query", False, f"Expected source 'cached', got '{data['source']}'")
        
        # Check count is still 6
        if data["count"] != 6:
            return log_test("Test 2: Cached Google query", False, f"Expected count 6, got {data['count']}")
        
        # Check response time is under 3 seconds
        if elapsed >= 3.0:
            return log_test("Test 2: Cached Google query", False, f"Expected response < 3s, got {elapsed:.1f}s")
        
        return log_test("Test 2: Cached Google query", True, f"Cached response in {elapsed:.1f}s with 6 leads")
    
    except Exception as e:
        return log_test("Test 2: Cached Google query", False, f"Exception: {str(e)}")

def test_3_generate_london_query():
    """Test 3: GET /api/leads?q=heads+of+sales+at+fintech+in+london (fresh query)"""
    print("\n🔍 Test 3: Fresh query 'heads of sales at fintech in london' (may take 60s)...")
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/leads?q=heads+of+sales+at+fintech+in+london", timeout=TIMEOUT)
        elapsed = time.time() - start_time
        
        print(f"   Response received in {elapsed:.1f}s")
        
        if response.status_code != 200:
            return log_test("Test 3: Generate London query", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Check source is "generated" or "cached"
        if data["source"] not in ["generated", "cached"]:
            return log_test("Test 3: Generate London query", False, f"Expected source 'generated' or 'cached', got '{data['source']}'")
        
        # Check count is 6
        if data["count"] != 6:
            return log_test("Test 3: Generate London query", False, f"Expected count 6, got {data['count']}")
        
        # Validate results have London in location and Sales in title
        for i, result in enumerate(data["results"]):
            location = result.get("location", "").lower()
            if "london" not in location:
                return log_test("Test 3: Generate London query", False, f"Result {i} location doesn't mention London: {result.get('location')}")
            
            title = result.get("title", "").lower()
            if "sales" not in title:
                return log_test("Test 3: Generate London query", False, f"Result {i} title doesn't contain 'Sales': {result.get('title')}")
        
        return log_test("Test 3: Generate London query", True, f"Generated 6 London sales leads in {elapsed:.1f}s, source: {data['source']}")
    
    except requests.exceptions.Timeout:
        return log_test("Test 3: Generate London query", False, f"Request timed out after {TIMEOUT}s")
    except Exception as e:
        return log_test("Test 3: Generate London query", False, f"Exception: {str(e)}")

def test_4_get_generated_lead_detail():
    """Test 4: GET /api/leads/<gen_id> (individual lead detail)"""
    global GENERATED_LEAD_ID
    
    if not GENERATED_LEAD_ID:
        return log_test("Test 4: Get generated lead detail", False, "No generated lead ID from Test 1")
    
    print(f"\n🔍 Test 4: Get individual generated lead detail for {GENERATED_LEAD_ID}...")
    try:
        response = requests.get(f"{BASE_URL}/leads/{GENERATED_LEAD_ID}", timeout=10)
        
        if response.status_code != 200:
            return log_test("Test 4: Get generated lead detail", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Check response structure
        if "lead" not in data:
            return log_test("Test 4: Get generated lead detail", False, "Missing 'lead' in response")
        
        lead = data["lead"]
        
        # Check companyDetails exists
        if "companyDetails" not in lead:
            return log_test("Test 4: Get generated lead detail", False, "Missing 'companyDetails' in lead")
        
        # Check lead name matches
        if not lead.get("name"):
            return log_test("Test 4: Get generated lead detail", False, "Lead name is missing")
        
        return log_test("Test 4: Get generated lead detail", True, f"Retrieved lead: {lead['name']}, company: {lead.get('company')}")
    
    except Exception as e:
        return log_test("Test 4: Get generated lead detail", False, f"Exception: {str(e)}")

def test_5_chat_with_generated_lead():
    """Test 5: POST /api/chat with generated lead"""
    global GENERATED_LEAD_ID
    
    if not GENERATED_LEAD_ID:
        return log_test("Test 5: Chat with generated lead", False, "No generated lead ID from Test 1")
    
    print(f"\n💬 Test 5: Chat with generated lead {GENERATED_LEAD_ID}...")
    try:
        payload = {
            "leadId": GENERATED_LEAD_ID,
            "message": "Write a 25-word cold opener"
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=TIMEOUT)
        
        if response.status_code != 200:
            data = response.json()
            return log_test("Test 5: Chat with generated lead", False, f"Expected 200, got {response.status_code}: {data}")
        
        data = response.json()
        
        # Check response structure
        if "sessionId" not in data or "reply" not in data:
            return log_test("Test 5: Chat with generated lead", False, "Missing 'sessionId' or 'reply' in response")
        
        reply = data["reply"]
        
        # Check reply is non-empty and > 30 chars
        if not reply or len(reply) < 30:
            return log_test("Test 5: Chat with generated lead", False, f"Reply too short: {len(reply)} chars")
        
        return log_test("Test 5: Chat with generated lead", True, f"Claude replied with {len(reply)} chars, sessionId: {data['sessionId'][:8]}...")
    
    except Exception as e:
        return log_test("Test 5: Chat with generated lead", False, f"Exception: {str(e)}")

def test_6_outreach_with_generated_lead():
    """Test 6: POST /api/outreach with generated lead"""
    global GENERATED_LEAD_ID
    
    if not GENERATED_LEAD_ID:
        return log_test("Test 6: Outreach with generated lead", False, "No generated lead ID from Test 1")
    
    print(f"\n📧 Test 6: Generate outreach for generated lead {GENERATED_LEAD_ID}...")
    try:
        payload = {
            "leadId": GENERATED_LEAD_ID,
            "type": "linkedin_message",
            "tone": "friendly"
        }
        response = requests.post(f"{BASE_URL}/outreach", json=payload, timeout=TIMEOUT)
        
        if response.status_code != 200:
            data = response.json()
            return log_test("Test 6: Outreach with generated lead", False, f"Expected 200, got {response.status_code}: {data}")
        
        data = response.json()
        
        # Check response structure
        if "type" not in data or "tone" not in data or "content" not in data:
            return log_test("Test 6: Outreach with generated lead", False, "Missing 'type', 'tone', or 'content' in response")
        
        content = data["content"]
        
        # Check content is non-empty and > 100 chars
        if not content or len(content) < 100:
            return log_test("Test 6: Outreach with generated lead", False, f"Content too short: {len(content)} chars")
        
        return log_test("Test 6: Outreach with generated lead", True, f"Generated {data['type']} with {len(content)} chars")
    
    except Exception as e:
        return log_test("Test 6: Outreach with generated lead", False, f"Exception: {str(e)}")

def test_7_sanity_seeded_leads():
    """Test 7: Sanity check - GET /api/leads?q=VP (seeded leads still work)"""
    print("\n🔍 Test 7: Sanity check - query 'VP' should still return seeded leads...")
    try:
        response = requests.get(f"{BASE_URL}/leads?q=VP", timeout=10)
        
        if response.status_code != 200:
            return log_test("Test 7: Sanity check VP query", False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        
        # Check source is "seeded"
        if data["source"] != "seeded":
            return log_test("Test 7: Sanity check VP query", False, f"Expected source 'seeded', got '{data['source']}'")
        
        # Check count >= 1
        if data["count"] < 1:
            return log_test("Test 7: Sanity check VP query", False, f"Expected count >= 1, got {data['count']}")
        
        return log_test("Test 7: Sanity check VP query", True, f"Seeded leads still work, returned {data['count']} VP results")
    
    except Exception as e:
        return log_test("Test 7: Sanity check VP query", False, f"Exception: {str(e)}")

def main():
    """Run all tests"""
    print("=" * 80)
    print("BUG FIX VERIFICATION: AI-GENERATED LEADS FOR QUERIES WITH NO SEEDED MATCHES")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    print("\nFeature: When a query has NO seeded matches, backend calls Claude Sonnet 4.5")
    print("to generate 6 realistic prospects, stores them in MongoDB (collection")
    print("'generated_leads' tagged with '_query'), and returns them. Subsequent")
    print("identical queries are served from cache instantly.")
    print("=" * 80)
    
    # Run all 7 tests in order
    test_1_generate_google_query()
    time.sleep(1)
    
    test_2_cached_google_query()
    time.sleep(1)
    
    test_3_generate_london_query()
    time.sleep(1)
    
    test_4_get_generated_lead_detail()
    time.sleep(1)
    
    test_5_chat_with_generated_lead()
    time.sleep(1)
    
    test_6_outreach_with_generated_lead()
    time.sleep(1)
    
    test_7_sanity_seeded_leads()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for r in TEST_RESULTS if r["passed"])
    total = len(TEST_RESULTS)
    print(f"\nTotal: {passed}/{total} tests passed\n")
    
    if passed < total:
        print("❌ FAILED TESTS:")
        for r in TEST_RESULTS:
            if not r["passed"]:
                print(f"  - {r['test']}: {r['message']}")
        print("\n" + "=" * 80)
        sys.exit(1)
    else:
        print("✅ ALL TESTS PASSED!")
        print("\nBug fix verification complete. The AI-generated leads feature is working")
        print("correctly. Queries with no seeded matches now generate realistic prospects")
        print("via Claude, and subsequent identical queries are served from cache.")
        print("\n" + "=" * 80)
        sys.exit(0)

if __name__ == "__main__":
    main()
