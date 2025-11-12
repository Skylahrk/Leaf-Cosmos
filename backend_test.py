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

def test_satellite_list_endpoint():
    """Test satellite list endpoint"""
    print("\n" + "=" * 60)
    print("TESTING SATELLITE LIST ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    endpoint_url = f"{backend_url}/api/satellites/list"
    print(f"Testing endpoint: {endpoint_url}")
    
    try:
        response = requests.get(endpoint_url, timeout=30)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Received JSON response")
        
        # Verify response structure
        if not isinstance(data, list):
            print(f"❌ FAILED: Expected list response, got {type(data)}")
            return False
        
        if len(data) == 0:
            print(f"❌ FAILED: Expected satellite groups, got empty list")
            return False
        
        # Check each satellite group
        required_fields = ['group_id', 'group_name', 'tle_url']
        for i, group in enumerate(data):
            print(f"\n🔍 Checking satellite group {i+1}:")
            for field in required_fields:
                if field not in group:
                    print(f"❌ FAILED: Missing field '{field}' in group {i+1}")
                    return False
                print(f"  ✅ {field}: {group[field]}")
        
        print(f"\n✅ SUCCESS: Satellite list endpoint working correctly!")
        print(f"📊 Found {len(data)} satellite groups")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing satellite list - {e}")
        return False

def test_satellite_tle_endpoint():
    """Test satellite TLE data endpoint"""
    print("\n" + "=" * 60)
    print("TESTING SATELLITE TLE ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    # Test with stations group
    endpoint_url = f"{backend_url}/api/satellites/tle/stations"
    print(f"Testing endpoint: {endpoint_url}")
    
    try:
        response = requests.get(endpoint_url, timeout=30)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Received JSON response")
        
        # Verify response structure
        required_fields = ['group_id', 'satellites']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in response")
                return False
        
        if data['group_id'] != 'stations':
            print(f"❌ FAILED: Expected group_id 'stations', got '{data['group_id']}'")
            return False
        
        satellites = data['satellites']
        if not isinstance(satellites, list) or len(satellites) == 0:
            print(f"❌ FAILED: Expected non-empty satellites list")
            return False
        
        # Check first satellite structure
        sat = satellites[0]
        sat_fields = ['name', 'line1', 'line2']
        print(f"\n🔍 Checking first satellite structure:")
        for field in sat_fields:
            if field not in sat:
                print(f"❌ FAILED: Missing field '{field}' in satellite data")
                return False
            print(f"  ✅ {field}: {sat[field][:50]}...")
        
        # Verify TLE format
        if not sat['line1'].startswith('1 ') or not sat['line2'].startswith('2 '):
            print(f"❌ FAILED: Invalid TLE format")
            return False
        
        print(f"\n✅ SUCCESS: Satellite TLE endpoint working correctly!")
        print(f"📊 Found {len(satellites)} satellites in stations group")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing satellite TLE - {e}")
        return False

def test_satellite_position_endpoint():
    """Test satellite position calculation endpoint"""
    print("\n" + "=" * 60)
    print("TESTING SATELLITE POSITION ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    endpoint_url = f"{backend_url}/api/satellites/position"
    print(f"Testing endpoint: {endpoint_url}")
    
    # Sample ISS TLE data (these are example values)
    test_data = {
        "name": "ISS (ZARYA)",
        "line1": "1 25544U 98067A   24001.00000000  .00002182  00000-0  40768-4 0  9990",
        "line2": "2 25544  51.6461 339.7939 0001220  92.8340 267.3124 15.49309239426382",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "datetime": datetime.now().isoformat() + "Z"
    }
    
    try:
        response = requests.post(endpoint_url, json=test_data, timeout=30)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Received JSON response")
        
        # Verify response structure
        required_fields = ['name', 'latitude', 'longitude', 'altitude_km', 'observer_altitude', 'observer_azimuth', 'distance_km', 'visible']
        print(f"\n🔍 Checking satellite position fields:")
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in response")
                return False
            print(f"  ✅ {field}: {data[field]}")
        
        # Verify data types and ranges
        if not isinstance(data['latitude'], (int, float)) or not (-90 <= data['latitude'] <= 90):
            print(f"❌ FAILED: Invalid latitude value: {data['latitude']}")
            return False
        
        if not isinstance(data['longitude'], (int, float)) or not (-180 <= data['longitude'] <= 180):
            print(f"❌ FAILED: Invalid longitude value: {data['longitude']}")
            return False
        
        if not isinstance(data['altitude_km'], (int, float)) or data['altitude_km'] < 0:
            print(f"❌ FAILED: Invalid altitude value: {data['altitude_km']}")
            return False
        
        if not isinstance(data['visible'], bool):
            print(f"❌ FAILED: Visible should be boolean, got: {type(data['visible'])}")
            return False
        
        print(f"\n✅ SUCCESS: Satellite position endpoint working correctly!")
        print(f"📊 Position: {data['latitude']:.4f}°, {data['longitude']:.4f}°, {data['altitude_km']:.2f} km")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing satellite position - {e}")
        return False

def test_satellite_passes_endpoint():
    """Test satellite pass predictions endpoint"""
    print("\n" + "=" * 60)
    print("TESTING SATELLITE PASSES ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    endpoint_url = f"{backend_url}/api/satellites/passes"
    print(f"Testing endpoint: {endpoint_url}")
    
    # Sample ISS TLE data
    test_data = {
        "name": "ISS (ZARYA)",
        "line1": "1 25544U 98067A   24001.00000000  .00002182  00000-0  40768-4 0  9990",
        "line2": "2 25544  51.6461 339.7939 0001220  92.8340 267.3124 15.49309239426382",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "datetime": datetime.now().isoformat() + "Z",
        "days": 7
    }
    
    try:
        response = requests.post(endpoint_url, json=test_data, timeout=30)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Received JSON response")
        
        # Verify response structure
        if 'satellite' not in data or 'passes' not in data:
            print(f"❌ FAILED: Missing required fields in response")
            return False
        
        if data['satellite'] != test_data['name']:
            print(f"❌ FAILED: Satellite name mismatch")
            return False
        
        passes = data['passes']
        if not isinstance(passes, list):
            print(f"❌ FAILED: Passes should be a list")
            return False
        
        print(f"📊 Found {len(passes)} satellite passes")
        
        # Check pass structure if any passes found
        if len(passes) > 0:
            pass_obj = passes[0]
            print(f"\n🔍 Checking first pass structure:")
            if 'rise_time' in pass_obj:
                print(f"  ✅ rise_time: {pass_obj['rise_time']}")
            if 'max_time' in pass_obj:
                print(f"  ✅ max_time: {pass_obj['max_time']}")
            if 'set_time' in pass_obj:
                print(f"  ✅ set_time: {pass_obj['set_time']}")
        
        print(f"\n✅ SUCCESS: Satellite passes endpoint working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing satellite passes - {e}")
        return False

def test_lunar_eclipses_endpoint():
    """Test lunar eclipses endpoint"""
    print("\n" + "=" * 60)
    print("TESTING LUNAR ECLIPSES ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    endpoint_url = f"{backend_url}/api/eclipses/lunar"
    print(f"Testing endpoint: {endpoint_url}")
    
    try:
        response = requests.get(endpoint_url, timeout=30)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Received JSON response")
        
        # Verify response structure
        if 'eclipses' not in data:
            print(f"❌ FAILED: Missing 'eclipses' field in response")
            return False
        
        eclipses = data['eclipses']
        if not isinstance(eclipses, list):
            print(f"❌ FAILED: Eclipses should be a list")
            return False
        
        print(f"📊 Found {len(eclipses)} lunar eclipses")
        
        # Check eclipse structure if any eclipses found
        if len(eclipses) > 0:
            eclipse = eclipses[0]
            required_fields = ['date', 'time', 'type', 'datetime', 'description']
            print(f"\n🔍 Checking first eclipse structure:")
            for field in required_fields:
                if field not in eclipse:
                    print(f"❌ FAILED: Missing field '{field}' in eclipse data")
                    return False
                print(f"  ✅ {field}: {eclipse[field]}")
            
            # Verify eclipse type
            valid_types = ['Penumbral', 'Partial', 'Total']
            if eclipse['type'] not in valid_types:
                print(f"❌ FAILED: Invalid eclipse type: {eclipse['type']}")
                return False
        
        print(f"\n✅ SUCCESS: Lunar eclipses endpoint working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing lunar eclipses - {e}")
        return False

def test_solar_eclipses_endpoint():
    """Test solar eclipses endpoint"""
    print("\n" + "=" * 60)
    print("TESTING SOLAR ECLIPSES ENDPOINT")
    print("=" * 60)
    
    backend_url = get_backend_url()
    if not backend_url:
        print("❌ FAILED: Could not get backend URL")
        return False
    
    endpoint_url = f"{backend_url}/api/eclipses/solar"
    print(f"Testing endpoint: {endpoint_url}")
    
    # Test data with sample location
    test_data = {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "datetime": datetime.now().isoformat() + "Z"
    }
    
    try:
        response = requests.post(endpoint_url, json=test_data, timeout=30)
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status code 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Received JSON response")
        
        # Verify response structure
        if 'eclipses' not in data:
            print(f"❌ FAILED: Missing 'eclipses' field in response")
            return False
        
        eclipses = data['eclipses']
        if not isinstance(eclipses, list):
            print(f"❌ FAILED: Eclipses should be a list")
            return False
        
        print(f"📊 Found {len(eclipses)} solar eclipses")
        
        # Check eclipse structure if any eclipses found
        if len(eclipses) > 0:
            eclipse = eclipses[0]
            required_fields = ['date', 'time', 'type', 'datetime', 'description']
            print(f"\n🔍 Checking first eclipse structure:")
            for field in required_fields:
                if field not in eclipse:
                    print(f"❌ FAILED: Missing field '{field}' in eclipse data")
                    return False
                print(f"  ✅ {field}: {eclipse[field]}")
            
            # Verify eclipse type
            valid_types = ['Partial', 'Total/Annular']
            if eclipse['type'] not in valid_types:
                print(f"❌ FAILED: Invalid eclipse type: {eclipse['type']}")
                return False
        
        print(f"\n✅ SUCCESS: Solar eclipses endpoint working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error testing solar eclipses - {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test results
    results = {}
    
    # Test API root
    results['api_root'] = test_api_root()
    
    # Test NASA APOD endpoint (existing feature)
    results['nasa_apod'] = test_nasa_apod_endpoint()
    
    # Test NEW Satellite Tracking endpoints (HIGH PRIORITY)
    results['satellite_list'] = test_satellite_list_endpoint()
    results['satellite_tle'] = test_satellite_tle_endpoint()
    results['satellite_position'] = test_satellite_position_endpoint()
    results['satellite_passes'] = test_satellite_passes_endpoint()
    
    # Test NEW Eclipse Prediction endpoints (HIGH PRIORITY)
    results['lunar_eclipses'] = test_lunar_eclipses_endpoint()
    results['solar_eclipses'] = test_solar_eclipses_endpoint()
    
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