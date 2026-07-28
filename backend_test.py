#!/usr/bin/env python3
"""
Backend API Tests for Quality Leads Application
Tests all endpoints as specified in the review request
"""

import requests
import json
import time
import sys

# Base URL from environment
BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com/api"

# Test configuration
TIMEOUT = 30  # 30 seconds timeout for LLM calls
TEST_RESULTS = []

def log_test(test_name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    print(result)
    TEST_RESULTS.append({"test": test_name, "passed": passed, "message": message})
    return passed

def test_leads_search_with_query():
    """Test 1: GET /api/leads?q=VP - should return filtered results"""
    try:
        response = requests.get(f"{BASE_URL}/leads?q=VP", timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("GET /api/leads?q=VP", False, f"Expected 200, got {response.status_code}")
        
        if "results" not in data or "count" not in data:
            return log_test("GET /api/leads?q=VP", False, "Missing 'results' or 'count' in response")
        
        if data["count"] < 1:
            return log_test("GET /api/leads?q=VP", False, f"Expected count >= 1, got {data['count']}")
        
        # Verify results contain VP titles
        vp_found = any("VP" in lead.get("title", "") for lead in data["results"])
        if not vp_found:
            return log_test("GET /api/leads?q=VP", False, "No VP titles found in results")
        
        return log_test("GET /api/leads?q=VP", True, f"Returned {data['count']} results with VP titles")
    except Exception as e:
        return log_test("GET /api/leads?q=VP", False, f"Exception: {str(e)}")

def test_leads_search_no_query():
    """Test 2: GET /api/leads - should return all 8 seeded leads"""
    try:
        response = requests.get(f"{BASE_URL}/leads", timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("GET /api/leads (no query)", False, f"Expected 200, got {response.status_code}")
        
        if data["count"] != 8:
            return log_test("GET /api/leads (no query)", False, f"Expected 8 leads, got {data['count']}")
        
        return log_test("GET /api/leads (no query)", True, f"Returned all {data['count']} seeded leads")
    except Exception as e:
        return log_test("GET /api/leads (no query)", False, f"Exception: {str(e)}")

def test_lead_profile_valid():
    """Test 3: GET /api/leads/lead_001 - should return lead with companyDetails"""
    try:
        response = requests.get(f"{BASE_URL}/leads/lead_001", timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("GET /api/leads/lead_001", False, f"Expected 200, got {response.status_code}")
        
        if "lead" not in data:
            return log_test("GET /api/leads/lead_001", False, "Missing 'lead' in response")
        
        lead = data["lead"]
        if "companyDetails" not in lead:
            return log_test("GET /api/leads/lead_001", False, "Missing 'companyDetails' in lead")
        
        company = lead["companyDetails"]
        required_fields = ["revenue", "techStack", "news"]
        missing = [f for f in required_fields if f not in company]
        if missing:
            return log_test("GET /api/leads/lead_001", False, f"Missing company fields: {missing}")
        
        return log_test("GET /api/leads/lead_001", True, f"Lead: {lead['name']}, Company: {company['name']}")
    except Exception as e:
        return log_test("GET /api/leads/lead_001", False, f"Exception: {str(e)}")

def test_lead_profile_invalid():
    """Test 4: GET /api/leads/lead_xyz - should return 404"""
    try:
        response = requests.get(f"{BASE_URL}/leads/lead_xyz", timeout=10)
        
        if response.status_code != 404:
            return log_test("GET /api/leads/lead_xyz (invalid)", False, f"Expected 404, got {response.status_code}")
        
        return log_test("GET /api/leads/lead_xyz (invalid)", True, "Correctly returned 404")
    except Exception as e:
        return log_test("GET /api/leads/lead_xyz (invalid)", False, f"Exception: {str(e)}")

def test_chat_first_call():
    """Test 5: POST /api/chat - first call with leadId and message"""
    try:
        payload = {
            "leadId": "lead_001",
            "message": "Write a 30-word cold opener"
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=TIMEOUT)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("POST /api/chat (first call)", False, f"Expected 200, got {response.status_code}: {data}")
        
        if "sessionId" not in data or "reply" not in data:
            return log_test("POST /api/chat (first call)", False, "Missing 'sessionId' or 'reply' in response")
        
        reply = data["reply"]
        if len(reply) < 40:
            return log_test("POST /api/chat (first call)", False, f"Reply too short: {len(reply)} chars")
        
        # Check if reply mentions Sarah or Rippling context
        context_found = "sarah" in reply.lower() or "rippling" in reply.lower()
        if not context_found:
            return log_test("POST /api/chat (first call)", False, "Reply doesn't mention Sarah/Rippling context")
        
        # Store sessionId for next test
        global CHAT_SESSION_ID
        CHAT_SESSION_ID = data["sessionId"]
        
        return log_test("POST /api/chat (first call)", True, f"SessionId: {CHAT_SESSION_ID[:8]}..., Reply: {len(reply)} chars")
    except Exception as e:
        return log_test("POST /api/chat (first call)", False, f"Exception: {str(e)}")

def test_chat_multi_turn():
    """Test 6: POST /api/chat - second call with same sessionId (multi-turn)"""
    try:
        if not hasattr(test_chat_multi_turn, 'session_id'):
            # Use the session ID from previous test
            if 'CHAT_SESSION_ID' not in globals():
                return log_test("POST /api/chat (multi-turn)", False, "No sessionId from previous test")
            test_chat_multi_turn.session_id = CHAT_SESSION_ID
        
        payload = {
            "sessionId": test_chat_multi_turn.session_id,
            "leadId": "lead_001",
            "message": "Now make it shorter and add a P.S."
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=TIMEOUT)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("POST /api/chat (multi-turn)", False, f"Expected 200, got {response.status_code}")
        
        if "reply" not in data:
            return log_test("POST /api/chat (multi-turn)", False, "Missing 'reply' in response")
        
        reply = data["reply"]
        # Check if reply is shorter and has P.S.
        has_ps = "p.s." in reply.lower() or "ps:" in reply.lower() or "p.s:" in reply.lower()
        if not has_ps:
            return log_test("POST /api/chat (multi-turn)", False, "Reply doesn't contain P.S.")
        
        return log_test("POST /api/chat (multi-turn)", True, f"Multi-turn works, reply has P.S., {len(reply)} chars")
    except Exception as e:
        return log_test("POST /api/chat (multi-turn)", False, f"Exception: {str(e)}")

def test_chat_missing_fields():
    """Test 7: POST /api/chat - missing leadId or message should return 400"""
    try:
        # Test missing message
        response1 = requests.post(f"{BASE_URL}/chat", json={"leadId": "lead_001"}, timeout=10)
        if response1.status_code != 400:
            return log_test("POST /api/chat (missing message)", False, f"Expected 400, got {response1.status_code}")
        
        # Test missing leadId
        response2 = requests.post(f"{BASE_URL}/chat", json={"message": "test"}, timeout=10)
        if response2.status_code != 400:
            return log_test("POST /api/chat (missing leadId)", False, f"Expected 400, got {response2.status_code}")
        
        return log_test("POST /api/chat (missing fields)", True, "Both missing field cases return 400")
    except Exception as e:
        return log_test("POST /api/chat (missing fields)", False, f"Exception: {str(e)}")

def test_chat_invalid_lead():
    """Test 8: POST /api/chat - invalid leadId should return 404"""
    try:
        payload = {
            "leadId": "lead_invalid",
            "message": "test message"
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=10)
        
        if response.status_code != 404:
            return log_test("POST /api/chat (invalid leadId)", False, f"Expected 404, got {response.status_code}")
        
        return log_test("POST /api/chat (invalid leadId)", True, "Correctly returned 404")
    except Exception as e:
        return log_test("POST /api/chat (invalid leadId)", False, f"Exception: {str(e)}")

def test_outreach_all_types():
    """Test 9: POST /api/outreach - test all 7 types with consultative tone"""
    types = [
        "cold_email", "linkedin_message", "follow_up", "call_script",
        "voicemail", "breakup_email", "proposal_outline"
    ]
    
    all_passed = True
    for outreach_type in types:
        try:
            payload = {
                "leadId": "lead_002",
                "type": outreach_type,
                "tone": "consultative"
            }
            response = requests.post(f"{BASE_URL}/outreach", json=payload, timeout=TIMEOUT)
            data = response.json()
            
            if response.status_code != 200:
                log_test(f"POST /api/outreach ({outreach_type})", False, f"Expected 200, got {response.status_code}")
                all_passed = False
                continue
            
            if "type" not in data or "tone" not in data or "content" not in data:
                log_test(f"POST /api/outreach ({outreach_type})", False, "Missing required fields")
                all_passed = False
                continue
            
            if len(data["content"]) < 50:
                log_test(f"POST /api/outreach ({outreach_type})", False, f"Content too short: {len(data['content'])} chars")
                all_passed = False
                continue
            
            log_test(f"POST /api/outreach ({outreach_type})", True, f"{len(data['content'])} chars generated")
        except Exception as e:
            log_test(f"POST /api/outreach ({outreach_type})", False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def test_outreach_friendly_tone():
    """Test 10: POST /api/outreach - test friendly tone with cold_email"""
    try:
        payload = {
            "leadId": "lead_002",
            "type": "cold_email",
            "tone": "friendly"
        }
        response = requests.post(f"{BASE_URL}/outreach", json=payload, timeout=TIMEOUT)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("POST /api/outreach (friendly tone)", False, f"Expected 200, got {response.status_code}")
        
        if len(data["content"]) < 50:
            return log_test("POST /api/outreach (friendly tone)", False, f"Content too short: {len(data['content'])} chars")
        
        return log_test("POST /api/outreach (friendly tone)", True, f"{len(data['content'])} chars generated")
    except Exception as e:
        return log_test("POST /api/outreach (friendly tone)", False, f"Exception: {str(e)}")

def test_saved_workflow():
    """Test 11: POST /api/saved, GET /api/saved, DELETE /api/saved/:id - full workflow"""
    try:
        # Step 1: Save lead_003
        save_response = requests.post(f"{BASE_URL}/saved", json={"leadId": "lead_003"}, timeout=10)
        save_data = save_response.json()
        
        if save_response.status_code != 200:
            return log_test("POST /api/saved", False, f"Expected 200, got {save_response.status_code}")
        
        if not save_data.get("saved"):
            return log_test("POST /api/saved", False, "saved field not true")
        
        log_test("POST /api/saved (first time)", True, "Lead saved successfully")
        
        # Step 2: GET saved leads - should contain lead_003
        get_response = requests.get(f"{BASE_URL}/saved", timeout=10)
        get_data = get_response.json()
        
        if get_response.status_code != 200:
            return log_test("GET /api/saved", False, f"Expected 200, got {get_response.status_code}")
        
        saved_leads = get_data.get("saved", [])
        lead_003_found = any(item.get("leadId") == "lead_003" for item in saved_leads)
        
        if not lead_003_found:
            return log_test("GET /api/saved", False, "lead_003 not found in saved leads")
        
        # Verify snapshot fields
        lead_003_item = next(item for item in saved_leads if item.get("leadId") == "lead_003")
        if "snapshot" not in lead_003_item:
            return log_test("GET /api/saved", False, "Missing snapshot field")
        
        log_test("GET /api/saved (contains lead_003)", True, f"Found {len(saved_leads)} saved leads")
        
        # Step 3: Save again - should return alreadySaved
        save_again_response = requests.post(f"{BASE_URL}/saved", json={"leadId": "lead_003"}, timeout=10)
        save_again_data = save_again_response.json()
        
        if not save_again_data.get("alreadySaved"):
            return log_test("POST /api/saved (duplicate)", False, "alreadySaved not true")
        
        log_test("POST /api/saved (duplicate)", True, "Correctly detected duplicate")
        
        # Step 4: DELETE lead_003
        delete_response = requests.delete(f"{BASE_URL}/saved/lead_003", timeout=10)
        delete_data = delete_response.json()
        
        if delete_response.status_code != 200:
            return log_test("DELETE /api/saved/lead_003", False, f"Expected 200, got {delete_response.status_code}")
        
        if not delete_data.get("ok"):
            return log_test("DELETE /api/saved/lead_003", False, "ok field not true")
        
        log_test("DELETE /api/saved/lead_003", True, "Lead deleted successfully")
        
        # Step 5: GET saved leads again - should NOT contain lead_003
        final_get_response = requests.get(f"{BASE_URL}/saved", timeout=10)
        final_get_data = final_get_response.json()
        
        final_saved_leads = final_get_data.get("saved", [])
        lead_003_still_there = any(item.get("leadId") == "lead_003" for item in final_saved_leads)
        
        if lead_003_still_there:
            return log_test("GET /api/saved (after delete)", False, "lead_003 still present after deletion")
        
        return log_test("GET /api/saved (after delete)", True, "lead_003 successfully removed")
    except Exception as e:
        return log_test("Saved workflow", False, f"Exception: {str(e)}")

def test_crm_get():
    """Test 12: GET /api/crm - should auto-seed pipeline on first request"""
    try:
        response = requests.get(f"{BASE_URL}/crm", timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("GET /api/crm", False, f"Expected 200, got {response.status_code}")
        
        if "stages" not in data:
            return log_test("GET /api/crm", False, "Missing 'stages' in response")
        
        stages = data["stages"]
        expected_stages = ["new", "contacted", "discovery", "proposal", "negotiation", "won", "lost"]
        missing_stages = [s for s in expected_stages if s not in stages]
        
        if missing_stages:
            return log_test("GET /api/crm", False, f"Missing stages: {missing_stages}")
        
        # Check if there are seeded deals
        total_deals = sum(len(stages[s]) for s in stages)
        if total_deals < 1:
            return log_test("GET /api/crm", False, "No seeded deals found")
        
        # Store stages for next tests
        global CRM_STAGES
        CRM_STAGES = stages
        
        return log_test("GET /api/crm", True, f"Pipeline with {total_deals} seeded deals")
    except Exception as e:
        return log_test("GET /api/crm", False, f"Exception: {str(e)}")

def test_crm_add():
    """Test 13: POST /api/crm/add - add a new deal"""
    try:
        payload = {
            "leadId": "lead_005",
            "stage": "discovery",
            "note": "Test deal from automated testing",
            "value": 50000
        }
        response = requests.post(f"{BASE_URL}/crm/add", json=payload, timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("POST /api/crm/add", False, f"Expected 200, got {response.status_code}")
        
        if not data.get("ok"):
            return log_test("POST /api/crm/add", False, "ok field not true")
        
        if "deal" not in data or "stages" not in data:
            return log_test("POST /api/crm/add", False, "Missing 'deal' or 'stages' in response")
        
        deal = data["deal"]
        if "id" not in deal:
            return log_test("POST /api/crm/add", False, "Deal missing 'id' field")
        
        # Store deal for move test
        global ADDED_DEAL
        ADDED_DEAL = deal
        
        return log_test("POST /api/crm/add", True, f"Deal added: {deal['id'][:8]}..., value: ${deal['value']}")
    except Exception as e:
        return log_test("POST /api/crm/add", False, f"Exception: {str(e)}")

def test_crm_move():
    """Test 14: POST /api/crm/move - move deal between stages"""
    try:
        if 'ADDED_DEAL' not in globals():
            return log_test("POST /api/crm/move", False, "No deal from previous test")
        
        payload = {
            "deal": ADDED_DEAL,
            "from": "discovery",
            "to": "negotiation"
        }
        response = requests.post(f"{BASE_URL}/crm/move", json=payload, timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("POST /api/crm/move", False, f"Expected 200, got {response.status_code}")
        
        if not data.get("ok"):
            return log_test("POST /api/crm/move", False, "ok field not true")
        
        if "stages" not in data:
            return log_test("POST /api/crm/move", False, "Missing 'stages' in response")
        
        stages = data["stages"]
        
        # Verify deal is in negotiation stage
        deal_in_negotiation = any(d.get("id") == ADDED_DEAL["id"] for d in stages.get("negotiation", []))
        if not deal_in_negotiation:
            return log_test("POST /api/crm/move", False, "Deal not found in 'negotiation' stage")
        
        # Verify deal is NOT in discovery stage
        deal_in_discovery = any(d.get("id") == ADDED_DEAL["id"] for d in stages.get("discovery", []))
        if deal_in_discovery:
            return log_test("POST /api/crm/move", False, "Deal still in 'discovery' stage")
        
        return log_test("POST /api/crm/move", True, f"Deal moved from discovery to negotiation")
    except Exception as e:
        return log_test("POST /api/crm/move", False, f"Exception: {str(e)}")

def test_analytics():
    """Test 15: GET /api/analytics - should return stats and pipelineChart"""
    try:
        response = requests.get(f"{BASE_URL}/analytics", timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            return log_test("GET /api/analytics", False, f"Expected 200, got {response.status_code}")
        
        if "stats" not in data or "pipelineChart" not in data:
            return log_test("GET /api/analytics", False, "Missing 'stats' or 'pipelineChart'")
        
        stats = data["stats"]
        required_stats = ["totalLeads", "savedLeads", "aiConversations", "outreachGenerated"]
        missing_stats = [s for s in required_stats if s not in stats]
        
        if missing_stats:
            return log_test("GET /api/analytics", False, f"Missing stats: {missing_stats}")
        
        pipeline_chart = data["pipelineChart"]
        if not isinstance(pipeline_chart, list) or len(pipeline_chart) == 0:
            return log_test("GET /api/analytics", False, "pipelineChart is empty or not an array")
        
        return log_test("GET /api/analytics", True, f"Stats: {stats['totalLeads']} leads, Chart: {len(pipeline_chart)} data points")
    except Exception as e:
        return log_test("GET /api/analytics", False, f"Exception: {str(e)}")

def main():
    """Run all tests"""
    print("=" * 80)
    print("QUALITY LEADS BACKEND API TESTS")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    print()
    
    # Run all tests in order
    print("🔍 Testing Lead Search & Profile Endpoints...")
    test_leads_search_with_query()
    test_leads_search_no_query()
    test_lead_profile_valid()
    test_lead_profile_invalid()
    print()
    
    print("💬 Testing AI Chat Assistant (Claude Sonnet 4.5)...")
    test_chat_first_call()
    time.sleep(1)  # Brief pause between LLM calls
    test_chat_multi_turn()
    test_chat_missing_fields()
    test_chat_invalid_lead()
    print()
    
    print("📧 Testing AI Outreach Generator...")
    test_outreach_all_types()
    test_outreach_friendly_tone()
    print()
    
    print("⭐ Testing Saved Leads Workflow...")
    test_saved_workflow()
    print()
    
    print("📊 Testing CRM Pipeline...")
    test_crm_get()
    test_crm_add()
    test_crm_move()
    print()
    
    print("📈 Testing Analytics...")
    test_analytics()
    print()
    
    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for r in TEST_RESULTS if r["passed"])
    total = len(TEST_RESULTS)
    print(f"Total: {passed}/{total} tests passed")
    print()
    
    if passed < total:
        print("❌ FAILED TESTS:")
        for r in TEST_RESULTS:
            if not r["passed"]:
                print(f"  - {r['test']}: {r['message']}")
        sys.exit(1)
    else:
        print("✅ ALL TESTS PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    main()
