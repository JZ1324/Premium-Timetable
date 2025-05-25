# GitHub to Vercel Deployment Guide

This document outlines the steps to deploy your Premium-Timetable application from GitHub to Vercel.

## Prerequisites

1. GitHub account with the repository set up (https://github.com/JZ1324/Premium-Timetable)
2. Vercel account (sign up at https://vercel.com)

## Connecting GitHub to Vercel

1. Log in to your Vercel account
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose "GitHub" and authenticate if needed
5. Select your repository (JZ1324/Premium-Timetable)
6. Configure the project with the following settings:

### Project Configuration

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Environment Variables

Add the following environment variables:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0
REACT_APP_FIREBASE_AUTH_DOMAIN=timetable-28639.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=timetable-28639
REACT_APP_FIREBASE_STORAGE_BUCKET=timetable-28639.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653769103112
REACT_APP_FIREBASE_APP_ID=1:653769103112:web:7b7fe45718bec053843ebd
REACT_APP_FIREBASE_MEASUREMENT_ID=G-J0F10129PJ
```

### Advanced Settings (Optional)

- Check "Include source files outside of the root directory"
- Override the default behavior with the following:
  - Root Directory: `.`
  - Build Command: `npm run build && cp public/path-fix.js build/ && cp public/vercel-path-fix.js build/ && cp public/_redirects build/`

## Deployment

1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. You can access your deployed application at the provided Vercel URL

## Troubleshooting

If you encounter the "Unexpected token '<'" error:
1. Check if the path-fix.js and vercel-path-fix.js files are correctly included in the build
2. Verify that bundle.js is being referenced with an absolute path (starting with /)
3. Make sure the Firebase storage bucket is correctly set to "timetable-28639.appspot.com"

## Continuous Deployment

With the GitHub integration set up, any changes pushed to your main branch will automatically trigger a new deployment on Vercel.
