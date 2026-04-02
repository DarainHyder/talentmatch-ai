# ===== FILE: ./test_minimal.py =====

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_basic():
    """Test basic functionality without external dependencies"""
    try:
        # Test basic imports
        from backend.app import create_app
        app = create_app()
        print("✅ Flask app created successfully")
        
        # Test with test client
        with app.test_client() as client:
            # Test root route
            response = client.get('/')
            assert response.status_code == 200
            print("✅ Root route works")
            
            # Test jobs route
            response = client.get('/jobs/')
            assert response.status_code == 200
            print("✅ Jobs route works")
            
            # Test candidates route  
            response = client.get('/candidates/')
            assert response.status_code == 200
            print("✅ Candidates route works")
            
            # Test questions route
            response = client.get('/questions/')
            assert response.status_code == 200
            print("✅ Questions route works")
            
        return True
        
    except Exception as e:
        print(f"❌ Basic test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Running minimal backend test...")
    if test_basic():
        print("🎉 Minimal test passed! Backend should work.")
        print("\nStart the server with: python -m backend.app")
    else:
        print("❌ Minimal test failed.")