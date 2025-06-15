#!/bin/bash

# Deploy Firebase security rules and configuration
# This script deploys the Firestore security rules to allow user registration

echo "🔥 Deploying Firebase Firestore rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Install it with: npm install -g firebase-tools"
    echo "🔐 Then login with: firebase login"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Deploy Firestore rules
echo "📜 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "🎉 User registration should now work!"
    echo ""
    echo "📝 Rules Summary:"
    echo "   - Users can create their own documents during registration"
    echo "   - Users can read/write their own data"
    echo "   - Username availability checks are allowed"
    echo ""
else
    echo "❌ Failed to deploy Firestore rules"
    echo ""
    echo "🛠️  Manual deployment steps:"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Select your project: timetable-28639"
    echo "3. Go to Firestore Database > Rules"
    echo "4. Copy the contents of firestore.rules into the rules editor"
    echo "5. Click 'Publish'"
    exit 1
fi

echo ""
echo "🚀 You can now test user registration!"
