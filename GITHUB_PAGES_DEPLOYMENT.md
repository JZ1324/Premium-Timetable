# GitHub Pages Deployment Guide

## Overview

This document provides guidance on deploying this React application to GitHub Pages and troubleshooting common issues like 404 errors.

## Configuration Changes Made

The following changes have been made to support GitHub Pages deployment:

1. **Router Configuration**:
   - Created a conditional router that uses `HashRouter` for GitHub Pages and `BrowserRouter` for other environments
   - This avoids 404 errors on direct navigation to routes

2. **404.html Page**:
   - Updated to handle navigation and redirect to the hash-based routing when deployed on GitHub Pages

3. **GitHub Actions Workflow**:
   - Configured to properly handle environment variables
   - Set up proper deployment to the gh-pages branch

4. **Base Path**:
   - Set public URL to `/timetables/` for GitHub Pages

## Deployment Process

1. **Ensure Secrets Are Set Up**:
   - Go to your repository's Settings > Secrets > Actions
   - Add all required Firebase config values as secrets
   - Required secrets:
     - `REACT_APP_FIREBASE_API_KEY`
     - `REACT_APP_FIREBASE_AUTH_DOMAIN`
     - `REACT_APP_FIREBASE_PROJECT_ID`
     - `REACT_APP_FIREBASE_STORAGE_BUCKET`
     - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
     - `REACT_APP_FIREBASE_APP_ID`
     - `REACT_APP_FIREBASE_MEASUREMENT_ID`

2. **Manually Triggering Deployment**:
   - Option 1: Push changes to the `main` branch, which will trigger the GitHub Actions workflow
   - Option 2: Run the following commands locally:
     ```bash
     npm run build
     npm run deploy:github
     ```

3. **Verify Deployment**:
   - Check your GitHub Pages site: `https://jz1324.github.io/timetables/`
   - Check that routing works by navigating to different sections of the app
   - Refresh the page to ensure direct URL access works

## Troubleshooting 404 Errors

If you still encounter 404 errors:

1. **Check Repository Settings**:
   - Go to repository Settings > Pages
   - Ensure it's set to deploy from the `gh-pages` branch
   - Verify the custom domain settings (if any)

2. **Check Browser Console**:
   - Look for errors related to resource loading
   - Verify paths are correct when accessing resources

3. **Check Build Output**:
   - Ensure the `404.html` file is present in the `build` directory
   - Verify `index.html` has the correct `<base>` tag

4. **Try Clearing Cache**:
   - Use incognito/private mode to test deployment
   - Clear browser cache before testing

## Making Further Changes

If you need to modify the GitHub Pages configuration:

1. Edit `src/components/Router.js` to change routing behavior
2. Edit `public/404.html` to change redirect behavior
3. Update `webpack.config.js` if changing the base path 
   - Look for `publicPath: NODE_ENV === 'production' ? '/timetables/' : '/'`

Remember: Any path or repository name changes need to be consistently updated across all configuration files.
