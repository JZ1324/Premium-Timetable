# Firebase Deployment Verification

This guide will help you verify that your Firebase deployment to the site ID `timetable-28639-f04f7` is working correctly.

## Pre-Deployment Verification

Before deploying, you should verify that your Firebase configuration is correct:

1. Run the testing script:
   ```bash
   ./test-firebase-hosting.sh
   ```

2. Check that your `.firebaserc` file includes the site ID:
   ```json
   {
     "projects": {
       "default": "timetable-28639"
     },
     "targets": {
       "timetable-28639": {
         "hosting": {
           "timetable": [
             "timetable-28639-f04f7"
           ]
         }
       }
     }
   }
   ```

3. Verify your `firebase.json` file includes the target:
   ```json
   {
     "hosting": {
       "target": "timetable",
       "public": "build",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

## Deployment Process

1. Build your application:
   ```bash
   npm run build
   ```

2. Apply the hosting target:
   ```bash
   firebase target:apply hosting timetable timetable-28639-f04f7
   ```

3. Deploy to Firebase hosting:
   ```bash
   firebase deploy --only hosting:timetable
   ```

Or simply use the provided script:
```bash
./deploy-firebase.sh
```

## Post-Deployment Verification

After deployment, verify that your application is working correctly:

1. Visit the Firebase hosting URL:
   - https://timetable-28639-f04f7.web.app
   - https://timetable-28639-f04f7.firebaseapp.com

2. Test authentication functionality:
   - Try logging in with your credentials
   - Create a new account
   - Reset password

3. Test application functionality:
   - Create and edit timetable entries
   - Change themes
   - Access all pages and features

## Troubleshooting

### Authentication Issues

If you encounter authentication issues after deployment:

1. Verify that your Firebase Authentication service is enabled in the Firebase Console
2. Check that your application is using the correct Firebase config
3. Verify that the deployed app has the same authentication methods enabled as your development environment

### Routing Issues

If you encounter 404 errors or routing issues:

1. Verify that your `firebase.json` has the correct rewrites configuration
2. Check that your React Router is configured correctly for production
3. Clear your browser cache and try again

### Deployment Failures

If deployment fails:

1. Check the error messages in the terminal
2. Verify that you have the correct permissions for the Firebase project
3. Ensure your Firebase CLI is up to date:
   ```bash
   npm install -g firebase-tools@latest
   ```

## Viewing Deployment History

To view your deployment history:

```bash
firebase hosting:sites:list
```

To view details about a specific deployment:

```bash
firebase hosting:sites:detail timetable-28639-f04f7
```
