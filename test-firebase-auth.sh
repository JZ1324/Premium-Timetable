#!/bin/zsh

# Firebase Authentication Setup Test Script

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
