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

## Troubleshooting "Failed to initialize authentication service"

If you encounter the "Failed to initialize authentication service" error in your local development environment, follow these steps:

### 1. Verify API Key in .env File

The most common cause is a missing or invalid Firebase API key:

```bash
# Open the .env file 
nano .env

# Make sure the API key is set correctly
REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0
```

### 2. Run the Diagnostic Script

We've created a diagnostic script to help identify authentication issues:

```bash
# Make the script executable
chmod +x firebase-auth-diagnostic.sh

# Run the diagnostic script
./firebase-auth-diagnostic.sh
```

### 3. Check Browser Console

Detailed error messages appear in your browser's developer console:

1. Open developer tools (F12 or Cmd+Option+I)
2. Look for specific Firebase error messages
3. Common errors include:
   - "Firebase: Error (auth/invalid-api-key)"
   - "Firebase: Error (auth/network-request-failed)"

### 4. Restart Development Server

After updating the .env file, restart the development server:

```bash
# Stop any running development server (Ctrl+C)
# Then start it again
npm start
```

### 5. Clear Browser Cache

Sometimes browsers cache old configuration values:

1. Open developer tools → Application → Storage → Clear Site Data
2. Reload the page

### 6. Test Firebase Connection

You can test if your Firebase API key is working correctly:

```bash
# Test API key connectivity
curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary '{"returnSecureToken":true}'
```

### 7. Need More Help?

If you're still experiencing issues after trying these steps, run the diagnostic script and share the output for more targeted assistance.
