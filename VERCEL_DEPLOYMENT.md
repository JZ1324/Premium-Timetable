# Vercel Deployment Guide

This guide will help you set up your Firebase application properly on Vercel.

## Setting up Environment Variables in Vercel

1. Go to your Vercel dashboard and select your project.
2. Click on "Settings" at the top.
3. Choose "Environment Variables" from the left sidebar.
4. Add the following environment variables:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0
REACT_APP_FIREBASE_AUTH_DOMAIN=timetable-28639.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=timetable-28639
REACT_APP_FIREBASE_STORAGE_BUCKET=timetable-28639.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653769103112
REACT_APP_FIREBASE_APP_ID=1:653769103112:web:7b7fe45718bec053843ebd
REACT_APP_FIREBASE_MEASUREMENT_ID=G-J0F10129PJ
```

5. Ensure you add them to all environments (Production, Preview, and Development).
6. Click "Save" to store your environment variables.
7. Redeploy your application to apply the changes.

## Important Security Tips

1. **Never commit** your `.env` file to version control.
2. Always use environment variables for sensitive configuration.
3. Consider setting up Firebase security rules to restrict access based on user authentication.
4. In Firebase Console, you can add domain restrictions to your API key for additional security.

## API Key Restrictions

To secure your Firebase API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" > "Credentials"
4. Find your Firebase API key and click on it
5. Under "Application restrictions", add your Vercel domain(s):
   - yourapp.vercel.app
   - Any custom domains you use
6. Under "API restrictions", restrict it to only the Firebase services you need
7. Click "Save" to apply the restrictions
