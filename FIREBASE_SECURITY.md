# Firebase API Security Guidelines

This document provides important instructions for securing Firebase API keys in this application.

## Securing Your API Keys

The Firebase API key that was previously hardcoded has been removed from the codebase to improve security. Here's how to set up your environment:

1. **Create a `.env` file locally** (never commit this to Git)
2. Add your Firebase configuration to the `.env` file:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=timetable-28639.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=timetable-28639
   REACT_APP_FIREBASE_STORAGE_BUCKET=timetable-28639.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653769103112
   REACT_APP_FIREBASE_APP_ID=1:653769103112:web:ba7fac1278faff3d843ebd
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-3CSMHJHN2H
   ```

3. For production builds, create a `.env.production` file with the same variables plus:
   ```
   PUBLIC_URL=/timetables
   ```

## GitHub Pages Deployment

When deploying to GitHub Pages, you'll need to set these environment variables as secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`
   - `REACT_APP_FIREBASE_MEASUREMENT_ID`

## API Key Security Best Practices

- Never commit API keys to your repository
- Use environment variables to store sensitive values
- Consider setting up Firebase security rules to restrict domain access
- For client-side applications, set up restrictions in the Firebase console to limit API usage to specific domains

Remember that while these steps improve security, web client Firebase API keys cannot be completely secured. Always implement proper Firebase security rules to protect your data.
