#!/bin/bash

echo "====== Preparing for Vercel Deployment ======"

# Run our enhanced Vercel deployment script
./vercel-deploy.sh

if [ $? -ne 0 ]; then
    echo "Deployment preparation failed. Please check the errors above."
    exit 1
fi

echo "Build successful!"
echo ""
echo "====== Deployment Instructions ======"
echo ""
echo "Option 1: Deploy via Vercel CLI (Recommended)"
echo "1. Install Vercel CLI if you haven't: npm install -g vercel"
echo "2. Run: vercel --prod"
echo ""
echo "Option 2: Deploy via Vercel Dashboard"
echo "1. Go to the Vercel dashboard: https://vercel.com/dashboard"
echo "2. Import your project from GitHub or deploy directly from the 'build' folder"
echo ""
echo "3. In your Vercel project settings, add these environment variables:"
echo ""
echo "REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0"
echo "REACT_APP_FIREBASE_AUTH_DOMAIN=timetable-28639.firebaseapp.com"
echo "REACT_APP_FIREBASE_PROJECT_ID=timetable-28639"
echo "REACT_APP_FIREBASE_STORAGE_BUCKET=timetable-28639.appspot.com"
echo "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653769103112"
echo "REACT_APP_FIREBASE_APP_ID=1:653769103112:web:7b7fe45718bec053843ebd"
echo "REACT_APP_FIREBASE_MEASUREMENT_ID=G-J0F10129PJ"
echo ""
echo "4. Make sure your Firebase Authentication settings include your Vercel domain in Authorized Domains"
echo ""
echo "====== Important Note ======"
echo "The Firebase configuration is now hardcoded in src/firebase-config.js as a fallback,"
echo "so the application should work even without environment variables."
echo ""
echo "============================="
