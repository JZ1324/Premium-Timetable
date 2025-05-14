#!/bin/zsh

# Quick Fix Script for Firebase Authentication Issues
# This script helps fix the "Failed to initialize authentication service" error

echo "🔧 Firebase Authentication Quick Fix"
echo "==================================="

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  touch .env
fi

# Update the API key
echo "Updating Firebase API key in .env file..."
if grep -q "REACT_APP_FIREBASE_API_KEY=" .env; then
  # Replace existing API key
  sed -i '' 's/REACT_APP_FIREBASE_API_KEY=.*/REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0/' .env
else
  # Add API key if it doesn't exist
  echo "REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0" >> .env
fi

# Make sure other Firebase config values are present
echo "Checking other Firebase configuration values..."

if ! grep -q "REACT_APP_FIREBASE_AUTH_DOMAIN=" .env; then
  echo "REACT_APP_FIREBASE_AUTH_DOMAIN=timetable-28639.firebaseapp.com" >> .env
fi

if ! grep -q "REACT_APP_FIREBASE_PROJECT_ID=" .env; then
  echo "REACT_APP_FIREBASE_PROJECT_ID=timetable-28639" >> .env
fi

if ! grep -q "REACT_APP_FIREBASE_STORAGE_BUCKET=" .env; then
  echo "REACT_APP_FIREBASE_STORAGE_BUCKET=timetable-28639.firebasestorage.app" >> .env
fi

if ! grep -q "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=" .env; then
  echo "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653769103112" >> .env
fi

if ! grep -q "REACT_APP_FIREBASE_APP_ID=" .env; then
  echo "REACT_APP_FIREBASE_APP_ID=1:653769103112:web:7b7fe45718bec053843ebd" >> .env
fi

if ! grep -q "REACT_APP_FIREBASE_MEASUREMENT_ID=" .env; then
  echo "REACT_APP_FIREBASE_MEASUREMENT_ID=G-J0F10129PJ" >> .env
fi

echo "✅ .env file has been updated with Firebase configuration"

# Clean up any build artifacts
echo "Cleaning up build artifacts..."
rm -rf node_modules/.cache

# Start the development server
echo ""
echo "🚀 Starting development server..."
echo "If you still see authentication errors, check the browser console for details."
echo "Press Ctrl+C to stop the server when done testing."
echo ""

npm start
