#!/bin/zsh

# Firebase Authentication Diagnostic Script
# This script helps diagnose Firebase authentication issues

echo "🔍 Testing Firebase Authentication Configuration"
echo "================================================"

# Check for .env file
if [ -f .env ]; then
  echo "✅ .env file found"
  
  # Check if API key is set
  if grep -q "REACT_APP_FIREBASE_API_KEY=" .env; then
    API_KEY=$(grep "REACT_APP_FIREBASE_API_KEY=" .env | cut -d '=' -f2)
    if [ -z "$API_KEY" ]; then
      echo "❌ REACT_APP_FIREBASE_API_KEY is empty in .env file"
      echo "🔧 Fix: Add your Firebase API key to the .env file"
    else
      echo "✅ REACT_APP_FIREBASE_API_KEY is set in .env file"
    fi
  else
    echo "❌ REACT_APP_FIREBASE_API_KEY not found in .env file"
  fi
else
  echo "❌ .env file not found"
  echo "🔧 Fix: Create a .env file with Firebase configuration"
fi

# Check webpack config for env handling
if [ -f webpack.config.js ]; then
  echo "✅ webpack.config.js found"
  
  # Check if webpack config handles env variables
  if grep -q "dotenv" webpack.config.js; then
    echo "✅ webpack.config.js uses dotenv to load environment variables"
  else
    echo "❌ webpack.config.js may not be loading environment variables correctly"
  fi
else
  echo "❌ webpack.config.js not found"
fi

# Check public/index.html for Firebase initialization
if [ -f public/index.html ]; then
  echo "✅ public/index.html found"
  
  # Check Firebase config in index.html
  if grep -q "window.firebaseConfig" public/index.html; then
    echo "✅ public/index.html contains window.firebaseConfig"
    
    # Check for placeholder values
    if grep -q "%REACT_APP_FIREBASE_API_KEY%" public/index.html; then
      echo "ℹ️ public/index.html uses template placeholders for API keys"
      echo "  This requires proper .env variables to be set for development"
    fi
  else
    echo "❌ public/index.html does not contain window.firebaseConfig"
  fi
else
  echo "❌ public/index.html not found"
fi

# Check Firebase initialization in authService.js
if [ -f src/services/authService.js ]; then
  echo "✅ src/services/authService.js found"
  
  # Check initialization method
  if grep -q "initializeAuth" src/services/authService.js; then
    echo "✅ authService.js contains initializeAuth function"
    
    # Check for error handling
    if grep -q "catch" src/services/authService.js; then
      echo "✅ authService.js contains error handling"
    else
      echo "❌ authService.js may not have proper error handling"
    fi
  else
    echo "❌ authService.js does not contain expected initializeAuth function"
  fi
else
  echo "❌ src/services/authService.js not found"
fi

# Create a test HTML file to check Firebase authentication
echo ""
echo "📝 Creating a simple Firebase test file..."

mkdir -p firebase-auth-test
cat > firebase-auth-test/index.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>Firebase Auth Test</title>
  <script src="https://www.gstatic.com/firebasejs/11.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/11.7.1/firebase-auth-compat.js"></script>
  <script>
    // Get API key from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get('apiKey');
    
    // Firebase configuration
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: "timetable-28639.firebaseapp.com",
      projectId: "timetable-28639",
      storageBucket: "timetable-28639.firebasestorage.app",
      messagingSenderId: "653769103112",
      appId: "1:653769103112:web:ba7fac1278faff3d843ebd",
      measurementId: "G-3CSMHJHN2H"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Test authentication
    function testAuth() {
      firebase.auth().signInAnonymously()
        .then(() => {
          document.getElementById('result').textContent = "✅ Firebase authentication initialized successfully!";
          document.getElementById('result').style.color = "green";
        })
        .catch((error) => {
          document.getElementById('result').textContent = "❌ Error: " + error.message;
          document.getElementById('result').style.color = "red";
          console.error("Firebase error:", error);
        });
    }
  </script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    button { padding: 10px 15px; background: #3388ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    #result { margin-top: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Firebase Authentication Test</h1>
  <p>This page tests if Firebase authentication can be initialized properly with your API key.</p>
  <button onclick="testAuth()">Test Firebase Authentication</button>
  <div id="result">Click the button to test</div>
</body>
</html>
EOF

API_KEY=$(grep REACT_APP_FIREBASE_API_KEY .env | cut -d '=' -f2)

echo "✅ Created test page at firebase-auth-test/index.html"
echo "🔍 To test manually, open this file in a browser with your API key:"
echo "   file://${PWD}/firebase-auth-test/index.html?apiKey=${API_KEY}"

echo ""
echo "🔧 Firebase Authentication Troubleshooting Tips:"
echo "1. Make sure your Firebase API key is correctly set in .env file"
echo "2. Check if you have the correct Firebase SDK version in public/index.html"
echo "3. Verify that webpack is correctly loading environment variables"
echo "4. Clear your browser cache and try again"
echo "5. Check browser console for more detailed error messages"
echo ""
echo "Run 'npm start' after making any changes to test again."
