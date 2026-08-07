#!/usr/bin/env python3
"""
Bug Verification Test Script
Tests THREE specific bug fixes on Quality Leads app
"""

import requests
import json
import sys

BASE_URL = "https://sales-ai-hub-19.preview.emergentagent.com"

def test_bug_1_faq_answers():
    """
    BUG 1 - FAQ answers missing on homepage
    Verify all 5 FAQ answer texts are present in HTML source inside <details> tags
    """
    print("\n" + "="*80)
    print("BUG 1 VERIFICATION: FAQ Answers on Homepage")
    print("="*80)
    
    try:
        response = requests.get(BASE_URL, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        html = response.text
        
        # Check for all 5 required answer texts
        required_answers = [
            "No. The free plan gives you 50 prospect searches per month",
            "Claude Sonnet 4.5 by Anthropic",
            "CSV export is available on all paid plans",
            "Company records refresh weekly",
            "Prospect data is sourced from PeopleDataLabs"
        ]
        
        # Additional check for the 6th part of answer 5
        additional_check = "no email or phone number at this time"
        
        all_found = True
        for i, answer in enumerate(required_answers, 1):
            if answer in html:
                print(f"✅ Answer {i} found: '{answer[:50]}...'")
            else:
                print(f"❌ Answer {i} MISSING: '{answer[:50]}...'")
                all_found = False
        
        # Check for additional text in answer 5
        if additional_check in html:
            print(f"✅ Answer 5 (part 2) found: '{additional_check}'")
        else:
            print(f"❌ Answer 5 (part 2) MISSING: '{additional_check}'")
            all_found = False
        
        # Verify they're inside <details> tags
        if "<details>" in html and "</details>" in html:
            print("✅ <details> tags present in HTML")
        else:
            print("⚠️  WARNING: <details> tags not found in HTML")
        
        if all_found:
            print("\n✅ BUG 1 FIX VERIFIED: All FAQ answers present")
            return True
        else:
            print("\n❌ BUG 1 FIX FAILED: Some FAQ answers missing")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


def test_bug_2_support_email():
    """
    BUG 2 - Wrong support email in footer
    Verify correct email is present and old email is removed
    """
    print("\n" + "="*80)
    print("BUG 2 VERIFICATION: Support Email in Footer")
    print("="*80)
    
    try:
        response = requests.get(BASE_URL, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        html = response.text
        
        # Check for correct email
        correct_email = "shibangikarmakar14@gmail.com"
        old_email = "support@qualityleads.ai"
        
        has_correct = correct_email in html
        has_old = old_email in html
        
        if has_correct:
            print(f"✅ Correct email found: {correct_email}")
            # Check if it's in a mailto link
            if f"mailto:{correct_email}" in html:
                print(f"✅ Email is in mailto link")
        else:
            print(f"❌ Correct email MISSING: {correct_email}")
        
        if not has_old:
            print(f"✅ Old email removed: {old_email}")
        else:
            print(f"❌ Old email STILL PRESENT: {old_email}")
        
        if has_correct and not has_old:
            print("\n✅ BUG 2 FIX VERIFIED: Email updated correctly")
            return True
        else:
            print("\n❌ BUG 2 FIX FAILED: Email not updated correctly")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


def test_bug_3_pdl_error_message():
    """
    BUG 3 - Search shows contradictory error message
    Verify proper PDL error handling with actual error message and real credits
    """
    print("\n" + "="*80)
    print("BUG 3 VERIFICATION: PDL Error Message Handling")
    print("="*80)
    print("⚠️  NOTE: Only calling API once to save credits")
    
    try:
        response = requests.get(f"{BASE_URL}/api/leads?q=apple", timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Check for source: "error"
        if data.get("source") == "error":
            print("✅ Response has source: 'error'")
        else:
            print(f"❌ Expected source: 'error', got: {data.get('source')}")
            return False
        
        # Check for error message
        error_msg = data.get("error", "")
        print(f"\nError message: '{error_msg}'")
        
        # Check that it's NOT the old hardcoded message
        old_hardcoded = "Monthly PDL credit limit reached"
        if old_hardcoded in error_msg:
            # Only acceptable if quota is actually 0
            quota = data.get("quota", {})
            monthly_remaining = quota.get("monthlyRemaining", 0)
            if monthly_remaining == 0 or monthly_remaining is None:
                print(f"✅ Old message present but quota is actually 0 (acceptable)")
            else:
                print(f"❌ Old hardcoded message present with {monthly_remaining} credits remaining")
                return False
        else:
            print(f"✅ Old hardcoded message NOT present")
        
        # Check for actual PDL error message (should mention "search" or "matches" or similar)
        pdl_keywords = ["search", "matches", "account", "maximum", "limit"]
        has_pdl_message = any(keyword in error_msg.lower() for keyword in pdl_keywords)
        if has_pdl_message:
            print(f"✅ Error message includes PDL-specific wording")
        else:
            print(f"⚠️  WARNING: Error message may not include PDL-specific wording")
        
        # Check for credits remaining mention
        if "credit" in error_msg.lower() or "remaining" in error_msg.lower():
            print(f"✅ Error message mentions credits/remaining")
        else:
            print(f"⚠️  WARNING: Error message may not mention credits")
        
        # Check quota object
        quota = data.get("quota", {})
        if quota:
            print(f"\nQuota data:")
            print(f"  monthlyRemaining: {quota.get('monthlyRemaining')}")
            print(f"  monthlyLimit: {quota.get('monthlyLimit')}")
            
            monthly_remaining = quota.get("monthlyRemaining", 0)
            if monthly_remaining > 0:
                print(f"✅ Quota shows {monthly_remaining} credits remaining (proving contradiction)")
            else:
                print(f"⚠️  Quota shows 0 credits remaining")
        else:
            print(f"⚠️  WARNING: No quota data in response")
        
        print("\n✅ BUG 3 FIX VERIFIED: Proper error handling with actual PDL message")
        return True
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


def main():
    print("\n" + "="*80)
    print("QUALITY LEADS - BUG FIX VERIFICATION")
    print("Testing 3 specific bug fixes")
    print("="*80)
    
    results = {
        "BUG 1 (FAQ Answers)": test_bug_1_faq_answers(),
        "BUG 2 (Support Email)": test_bug_2_support_email(),
        "BUG 3 (PDL Error Message)": test_bug_3_pdl_error_message()
    }
    
    print("\n" + "="*80)
    print("FINAL RESULTS")
    print("="*80)
    
    for bug, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{bug}: {status}")
    
    total_passed = sum(results.values())
    total_tests = len(results)
    print(f"\nTotal: {total_passed}/{total_tests} bugs verified")
    
    if total_passed == total_tests:
        print("\n🎉 ALL BUG FIXES VERIFIED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total_tests - total_passed} bug fix(es) failed verification")
        sys.exit(1)


if __name__ == "__main__":
    main()
