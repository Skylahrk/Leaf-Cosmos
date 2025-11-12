#!/usr/bin/env python3
"""
Backend API Testing Script for Planetarium Application
Tests NASA APOD API endpoint and other backend functionality
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        return None

def test_nasa_apod_endpoint():
    """Test NASA APOD API endpoint"""
    print("=" * 60)
    print("TESTING NASA APOD API ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL from frontend/.env")
        return False
    
    print(f"Backend URL: {backend_url}")
    endpoint_url = f"{backend_url}/api/nasa/apod"
    print(f"Testing endpoint: {endpoint_url}")
    
    try:
        # Make GET request to NASA APOD endpoint
        print("\n📡 Making GET request to /api/nasa/apod...")
        response = requests.get(endpoint_url, timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        # Parse JSON response
        try:
            apod_data = response.json()
            print(f"✅ SUCCESS: Received JSON response")
        except json.JSONDecodeError as e:
            print(f"❌ FAILED: Invalid JSON response - {e}")
            print(f"Response text: {response.text}")
            return False
        
        # Verify required APOD fields
        required_fields = ['title', 'explanation', 'url', 'date', 'media_type']
        print(f"\n🔍 Checking required APOD fields: {required_fields}")
        
        missing_fields = []
        for field in required_fields:
            if field not in apod_data:
                missing_fields.append(field)
            else:
                print(f"  ✅ {field}: {type(apod_data[field]).__name__} - {str(apod_data[field])[:100]}...")
        
        if missing_fields:
            print(f"❌ FAILED: Missing required fields: {missing_fields}")
            return False
        
        # Verify data types and content
        print(f"\n🔍 Validating field content:")
        
        # Check title
        if not isinstance(apod_data['title'], str) or len(apod_data['title']) == 0:
            print(f"❌ FAILED: Title should be non-empty string")
            return False
        print(f"  ✅ Title: '{apod_data['title']}'")
        
        # Check explanation
        if not isinstance(apod_data['explanation'], str) or len(apod_data['explanation']) == 0:
            print(f"❌ FAILED: Explanation should be non-empty string")
            return False
        print(f"  ✅ Explanation: {len(apod_data['explanation'])} characters")
        
        # Check URL
        if not isinstance(apod_data['url'], str) or not apod_data['url'].startswith('http'):
            print(f"❌ FAILED: URL should be valid HTTP URL")
            return False
        print(f"  ✅ URL: {apod_data['url']}")
        
        # Check date format (should be YYYY-MM-DD)
        try:
            datetime.strptime(apod_data['date'], '%Y-%m-%d')
            print(f"  ✅ Date: {apod_data['date']} (valid format)")
        except ValueError:
            print(f"❌ FAILED: Date should be in YYYY-MM-DD format, got: {apod_data['date']}")
            return False
        
        # Check media type
        valid_media_types = ['image', 'video']
        if apod_data['media_type'] not in valid_media_types:
            print(f"❌ FAILED: Media type should be 'image' or 'video', got: {apod_data['media_type']}")
            return False
        print(f"  ✅ Media Type: {apod_data['media_type']}")
        
        # Additional optional fields check
        optional_fields = ['hdurl', 'copyright', 'service_version']
        print(f"\n🔍 Optional fields present:")
        for field in optional_fields:
            if field in apod_data:
                print(f"  ✅ {field}: {str(apod_data[field])[:100]}...")
        
        print(f"\n✅ SUCCESS: NASA APOD API endpoint working correctly!")
        print(f"📊 Full APOD Data Summary:")
        print(f"  - Title: {apod_data['title']}")
        print(f"  - Date: {apod_data['date']}")
        print(f"  - Media Type: {apod_data['media_type']}")
        print(f"  - URL: {apod_data['url']}")
        print(f"  - Explanation Length: {len(apod_data['explanation'])} chars")
        
        return True
        
    except requests.exceptions.Timeout:
        print(f"❌ FAILED: Request timeout (30s)")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ FAILED: Connection error - {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_api_root():
    """Test API root endpoint"""
    print("\n" + "=" * 60)
    print("TESTING API ROOT ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    endpoint_url = f"{backend_url}/api/"
    print(f"Testing endpoint: {endpoint_url}")
    
    try:
        response = requests.get(endpoint_url, timeout=10)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: API root accessible - {data}")
            return True
        else:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: Error testing API root - {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test results
    results = {}
    
    # Test API root
    results['api_root'] = test_api_root()
    
    # Test NASA APOD endpoint (main focus)
    results['nasa_apod'] = test_nasa_apod_endpoint()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)