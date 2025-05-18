# Environment Setup Guide

## Firebase Configuration

This application uses Firebase for authentication and data storage. To set up the environment properly:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the `.env` file with your Firebase project credentials:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   You can find these values in your Firebase project settings.

3. **Important Security Note**: Never commit the `.env` file to your repository. It contains sensitive information. The `.gitignore` file is configured to exclude it.

## Service Account Key

For admin operations (like setting a user as admin), you'll need a service account key:

1. Go to your Firebase project console: https://console.firebase.google.com/
2. Navigate to Project Settings > Service accounts
3. Click 'Generate new private key'
4. Save the downloaded JSON file as 'service-account-key.json' in the project root directory

This file is also excluded from Git via the `.gitignore` file for security reasons.
