# Firebase Hosting Setup Guide

This guide explains how to set up and deploy your application to Firebase Hosting using the site ID `timetable-28639-f04f7`.

## Prerequisites

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase**:
   ```bash
   firebase login
   ```

## Configuration Files

Two configuration files are needed for Firebase hosting:

1. **`.firebaserc`**: Defines your project settings and targets
2. **`firebase.json`**: Configures how Firebase hosting should behave

These files have been updated with the correct site ID `timetable-28639-f04f7`.

## Deploying to Firebase Hosting

### Option 1: Using the Deployment Script

The simplest way to deploy is using the provided script:

```bash
./deploy-firebase.sh
```

This script:
1. Builds your application
2. Applies the target site ID
3. Deploys to Firebase hosting

### Option 2: Manual Deployment

If you prefer to deploy manually:

```bash
# Build the application
npm run build

# Set the target site
firebase target:apply hosting timetable timetable-28639-f04f7

# Deploy only hosting
firebase deploy --only hosting:timetable
```

## Verifying Deployment

After successful deployment, your application will be available at:
- https://timetable-28639-f04f7.web.app
- https://timetable-28639-f04f7.firebaseapp.com

## Troubleshooting

If you encounter issues:

1. **Firebase CLI not found**: Make sure you've installed it globally with `npm install -g firebase-tools`
2. **Not authorized**: Run `firebase login` to authenticate
3. **Deployment fails**: Check for build errors in the console output

For more information, refer to the [Firebase Hosting documentation](https://firebase.google.com/docs/hosting).
