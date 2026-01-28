import requests
import sys
import json
from datetime import datetime

class AdvocacyFlowAPITester:
    def __init__(self, base_url="https://whatsapp-share-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            self.test_results.append({
                "name": name,
                "success": success,
                "status_code": response.status_code,
                "expected_status": expected_status
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_posts(self):
        """Test getting posts - should return 3 sample posts"""
        success, response = self.run_test("Get Posts", "GET", "posts", 200)
        if success and isinstance(response, list) and len(response) == 3:
            print(f"   ✅ Found {len(response)} posts as expected")
            # Check if posts have required fields
            required_fields = ['id', 'title', 'content', 'author_name', 'author_avatar', 'channel', 'timestamp']
            for i, post in enumerate(response):
                missing_fields = [field for field in required_fields if field not in post]
                if missing_fields:
                    print(f"   ⚠️  Post {i+1} missing fields: {missing_fields}")
                else:
                    print(f"   ✅ Post {i+1} has all required fields")
        elif success:
            print(f"   ⚠️  Expected 3 posts, got {len(response) if isinstance(response, list) else 'non-list'}")
        return success, response

    def test_phone_verification_flow(self):
        """Test complete phone verification flow"""
        user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"
        phone_number = "+1234567890"
        
        # Step 1: Send OTP
        success, response = self.run_test(
            "Send OTP",
            "POST",
            "phone/verify",
            200,
            data={"phone_number": phone_number, "user_id": user_id}
        )
        
        if not success:
            return False
            
        otp_hint = response.get('otp_hint', '')
        print(f"   OTP Hint: {otp_hint}")
        
        # For testing, we'll use a mock OTP (since real OTP is logged to console)
        # In real testing, you'd get this from backend logs
        mock_otp = "123456"  # This won't work, but tests the flow
        
        # Step 2: Verify OTP (will fail with mock OTP, but tests the endpoint)
        success, response = self.run_test(
            "Verify OTP (Mock)",
            "POST", 
            "phone/confirm",
            400,  # Expecting 400 for invalid OTP
            data={"phone_number": phone_number, "otp_code": mock_otp, "user_id": user_id}
        )
        
        # This should fail as expected with mock OTP
        print("   ℹ️  OTP verification failed as expected with mock code")
        
        return True

    def test_user_phone_check(self):
        """Test checking if user has verified phone"""
        user_id = "nonexistent_user"
        success, response = self.run_test(
            "Check User Phone (Non-existent)",
            "GET",
            f"user/{user_id}/phone",
            200
        )
        
        if success and response.get('has_phone') == False:
            print("   ✅ Correctly returned has_phone: false for non-existent user")
        
        return success

    def test_whatsapp_send_unverified(self):
        """Test WhatsApp send with unverified user (should fail)"""
        success, response = self.run_test(
            "WhatsApp Send (Unverified User)",
            "POST",
            "whatsapp/send",
            400,  # Should fail for unverified user
            data={"user_id": "unverified_user", "post_id": "test_post"}
        )
        
        if success or response:
            print("   ✅ Correctly rejected unverified user")
        
        return True

    def test_event_tracking(self):
        """Test event tracking"""
        success, response = self.run_test(
            "Track Event",
            "POST",
            "events/track",
            200,
            data={"user_id": "test_user", "post_id": "test_post", "action": "like"}
        )
        
        if success and response.get('success') == True:
            print("   ✅ Event tracked successfully")
        
        return success

def main():
    print("🚀 Starting AdvocacyFlow API Tests...")
    print("=" * 50)
    
    tester = AdvocacyFlowAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_get_posts,
        tester.test_phone_verification_flow,
        tester.test_user_phone_check,
        tester.test_whatsapp_send_unverified,
        tester.test_event_tracking
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print detailed results
    print(f"\n📋 Detailed Results:")
    for result in tester.test_results:
        status = "✅" if result['success'] else "❌"
        print(f"   {status} {result['name']}")
        if 'error' in result:
            print(f"      Error: {result['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())