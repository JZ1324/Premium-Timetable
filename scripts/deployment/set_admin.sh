#!/bin/bash

# Administrative script to set a user as admin in Firebase
# Usage: ./set_admin.sh <user_email>
#
# Note: This script requires:
# 1. Firebase CLI to be installed
# 2. A service-account-key.json file in this directory
# 3. Proper environment setup (.env file) - See ENV_SETUP.md for details

# Change to your Firebase project directory
cd "$(dirname "$0")"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI is not installed. Please install it with:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
firebase_status=$(firebase login:list 2>&1)
if [[ $firebase_status == *"No need to login"* ]] || [[ $firebase_status == *"User:"* ]]; then
    echo "Firebase CLI authenticated."
else
    echo "Please login to Firebase first:"
    firebase login
fi

# Check if user email was provided
if [ -z "$1" ]; then
    echo "Usage: ./set_admin.sh <user_email>"
    exit 1
fi

USER_EMAIL="$1"

# Create a temporary Node.js script to update Firestore
cat > temp_set_admin.js <<EOL
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setUserAsAdmin(email) {
  try {
    // Find the user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No user found with email:', email);
      process.exit(1);
    }
    
    // Update the first matching user document
    const userDoc = snapshot.docs[0];
    console.log('Found user:', userDoc.id);
    
    await userDoc.ref.update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ User set as admin successfully!');
  } catch (error) {
    console.error('Error setting user as admin:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setUserAsAdmin('${USER_EMAIL}');
EOL

echo "Checking for service account key..."

# Check if service account key exists
if [ ! -f "./service-account-key.json" ]; then
    echo "⚠️ service-account-key.json not found!"
    echo "Please follow these steps to create and download it:"
    echo "1. Go to your Firebase project console: https://console.firebase.google.com/"
    echo "2. Navigate to Project Settings > Service accounts"
    echo "3. Click 'Generate new private key'"
    echo "4. Save the downloaded JSON file as 'service-account-key.json' in this directory"
    echo "5. Run this script again"
    rm temp_set_admin.js
    exit 1
fi

# Run the script
echo "Setting user ${USER_EMAIL} as admin..."
node temp_set_admin.js

# Clean up
rm temp_set_admin.js

echo "Script execution completed."
