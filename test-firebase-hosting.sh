#!/bin/zsh

# Test Firebase hosting configuration with site ID timetable-28639-f04f7
echo "Testing Firebase hosting configuration for site ID: timetable-28639-f04f7"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Error: Firebase CLI is not installed. Please run setup-firebase-cli.sh first."
    exit 1
fi

# Check if user is logged in to Firebase
echo "Checking Firebase login status..."
firebase login:list || {
    echo "Not logged in to Firebase. Please run 'firebase login' first."
    exit 1
}

# Verify the project configuration
echo "Verifying Firebase project configuration..."
firebase projects:list | grep -q "timetable-28639" || {
    echo "Error: Project 'timetable-28639' not found in your Firebase account."
    exit 1
}

# Check if .firebaserc exists and contains correct site ID
if [ -f ".firebaserc" ]; then
    if grep -q "timetable-28639-f04f7" .firebaserc; then
        echo "✅ .firebaserc is correctly configured with site ID: timetable-28639-f04f7"
    else
        echo "❌ Site ID 'timetable-28639-f04f7' not found in .firebaserc"
        echo "Please update .firebaserc with the correct site ID."
    fi
else
    echo "❌ .firebaserc not found"
    echo "Please run 'firebase init' to initialize Firebase for this project."
fi

# Check if firebase.json exists and is correctly configured
if [ -f "firebase.json" ]; then
    if grep -q "\"target\": \"timetable\"" firebase.json; then
        echo "✅ firebase.json is correctly configured with target: timetable"
    else
        echo "❌ Target 'timetable' not found in firebase.json"
        echo "Please update firebase.json with the correct target."
    fi
else
    echo "❌ firebase.json not found"
    echo "Please run 'firebase init' to initialize Firebase for this project."
fi

# Verify the hosting target
echo "Verifying Firebase hosting target..."
firebase target:apply hosting timetable timetable-28639-f04f7 --dry-run || {
    echo "Error: Could not apply hosting target. Please check your Firebase configuration."
}

echo "Firebase hosting configuration test complete."
echo "If all checks passed, you can deploy using: ./deploy-firebase.sh"
