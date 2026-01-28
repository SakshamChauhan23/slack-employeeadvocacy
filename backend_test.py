import requests
import sys
import json
from datetime import datetime

class SocialRippleAPITester:
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
            # Check if posts have required fields for SocialRipple
            required_fields = ['id', 'title', 'content', 'category', 'timestamp']
            for i, post in enumerate(response):
                missing_fields = [field for field in required_fields if field not in post]
                if missing_fields:
                    print(f"   ⚠️  Post {i+1} missing fields: {missing_fields}")
                else:
                    print(f"   ✅ Post {i+1} has all required fields")
                    print(f"      Category: {post.get('category')}, Title: {post.get('title')[:50]}...")
        elif success:
            print(f"   ⚠️  Expected 3 posts, got {len(response) if isinstance(response, list) else 'non-list'}")
        return success, response

    def test_share_post(self):
        """Test sharing a post to different platforms"""
        user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"
        post_id = "test_post_id"
        
        platforms = ["twitter", "linkedin", "whatsapp"]
        
        for platform in platforms:
            success, response = self.run_test(
                f"Share Post to {platform.title()}",
                "POST",
                "share",
                200,
                data={"user_id": user_id, "post_id": post_id, "platform": platform}
            )
            
            if success and response.get('success') == True:
                print(f"   ✅ Successfully shared to {platform}")
                print(f"   Message: {response.get('message')}")
            elif success:
                print(f"   ⚠️  Unexpected response format for {platform}")
        
        return True

    def test_track_event(self):
        """Test event tracking"""
        user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"
        post_id = "test_post_id"
        actions = ["like", "retweet", "reply"]
        
        for action in actions:
            success, response = self.run_test(
                f"Track Event - {action}",
                "POST",
                "events/track",
                200,
                data={"user_id": user_id, "post_id": post_id, "action": action}
            )
            
            if success and response.get('success') == True:
                print(f"   ✅ Successfully tracked {action} event")
        
        return True

    def test_user_stats(self):
        """Test getting user stats"""
        user_id = f"test_user_{datetime.now().strftime('%H%M%S')}"
        
        success, response = self.run_test(
            "Get User Stats",
            "GET",
            f"stats/{user_id}",
            200
        )
        
        if success:
            print(f"   ✅ Stats retrieved successfully")
            print(f"   Total shares: {response.get('total_shares', 0)}")
            print(f"   Shares by platform: {response.get('shares_by_platform', [])}")
        
        return success

def main():
    print("🚀 Starting SocialRipple API Tests...")
    print("=" * 50)
    
    tester = SocialRippleAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_get_posts,
        tester.test_share_post,
        tester.test_track_event,
        tester.test_user_stats
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