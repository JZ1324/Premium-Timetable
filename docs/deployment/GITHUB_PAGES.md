# GitHub Pages Deployment

This project is set up to automatically deploy to GitHub Pages when changes are pushed to the main branch.

## Deployment URL

The site is accessible at: https://jz1324.github.io/timetables/

## How It Works

1. When code is pushed to the `main` branch, a GitHub Actions workflow is triggered.
2. The workflow builds the project and deploys it to the `gh-pages` branch.
3. GitHub Pages serves the content from the `gh-pages` branch.

## Setting Up Environment Variables

For the GitHub Actions workflow to build the project correctly, you need to set up the following secrets in your GitHub repository:

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

The values should match what you have in your local `.env` file.
