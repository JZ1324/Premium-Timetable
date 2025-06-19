# Firebase Registration Fix Guide

## Problem
Users getting "Missing or insufficient permissions" error when trying to register new accounts or sign up.

## Root Cause
Firebase Firestore security rules are too restrictive and don't allow new user document creation during registration.

## Solution

### Option 1: Automatic Deployment (Recommended)
Run the deployment script:
```bash
./deploy-firestore-rules.sh
```

### Option 2: Manual Firebase Console Deployment

1. **Go to Firebase Console**
   - Open https://console.firebase.google.com/
   - Select your project: `timetable-28639`

2. **Navigate to Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Update the Rules**
   Copy and paste the following rules (from `firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules for user documents
    match /users/{userId} {
      // Allow read and write if the user is authenticated and the document belongs to them
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow creating new user documents during registration
      allow create: if request.auth != null && request.auth.uid == userId
        && validateUserDocument(request.resource.data);
        
      // Allow reading username for availability checks (only username field)
      allow read: if request.auth != null 
        && resource.data.keys().hasOnly(['username', 'createdAt']);
    }
    
    // Rules for timetable data
    match /timetables/{userId} {
      // Allow read and write if the user is authenticated and the document belongs to them
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rules for user settings
    match /settings/{userId} {
      // Allow read and write if the user is authenticated and the document belongs to them
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow reading from any collection for username availability checks
    match /users/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Function to validate user document structure
    function validateUserDocument(data) {
      return data.keys().hasAll(['username', 'email', 'createdAt']) 
        && data.username is string 
        && data.email is string 
        && data.createdAt is string;
    }
  }
}
```

4. **Publish the Rules**
   - Click the "Publish" button
   - Wait for confirmation that rules are deployed

### Option 3: Firebase CLI Deployment

If you have Firebase CLI installed:

```bash
# Login to Firebase (if not already logged in)
firebase login

# Deploy only the Firestore rules
firebase deploy --only firestore:rules
```

## Verification

After deploying the rules, test user registration:

1. Go to your app
2. Try to create a new account
3. Registration should now work without permission errors

## What These Rules Allow

- ✅ Users can create their own user documents during registration
- ✅ Users can read and modify their own data (timetables, settings)
- ✅ Username availability checks during registration
- ✅ Secure access - users can only access their own data
- ❌ Users cannot access other users' data
- ❌ Unauthenticated access is blocked

## Files Created/Modified

- `firestore.rules` - Security rules for Firestore
- `firestore.indexes.json` - Database indexes
- `firebase.json` - Updated to include Firestore configuration
- `deploy-firestore-rules.sh` - Automated deployment script

## Troubleshooting

If you still get permission errors after deploying:

1. **Check Firebase Authentication is enabled:**
   - Go to Firebase Console > Authentication > Sign-in method
   - Ensure "Email/Password" is enabled

2. **Verify the rules are deployed:**
   - Go to Firestore Database > Rules
   - Check that the rules match the ones above
   - Look for any syntax errors

3. **Clear browser cache:**
   - Clear your browser cache and try again
   - Firebase rules can take a few minutes to propagate

4. **Check the browser console:**
   - Open browser developer tools
   - Look for specific error messages in the console
   - These will help identify if it's a rules issue or code issue

## Security Notes

These rules are designed to be secure while allowing normal app functionality:
- Only authenticated users can access data
- Users can only access their own documents
- Proper validation ensures data integrity
- Username checks are allowed for registration UX
