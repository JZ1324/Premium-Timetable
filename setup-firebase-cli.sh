#!/bin/zsh

# Install and configure Firebase CLI for deployment
echo "Setting up Firebase CLI for deployment to site ID: timetable-28639-f04f7"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install Firebase CLI globally if not already installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "Firebase CLI is already installed."
fi

# Login to Firebase (this will open a browser window)
echo "Please log in to your Firebase account..."
firebase login

# Initialize Firebase for this project (if not already done)
if [ ! -f ".firebaserc" ]; then
    echo "Initializing Firebase for this project..."
    firebase init hosting
else
    echo "Firebase project already initialized."
fi

# Set the target for the site ID
echo "Setting up target for site ID: timetable-28639-f04f7..."
firebase target:apply hosting timetable timetable-28639-f04f7

echo "Firebase CLI setup complete!"
echo "You can now deploy your application using: ./deploy-firebase.sh"
echo "Or run: npm run deploy"
