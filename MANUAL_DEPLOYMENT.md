# Manual GitHub Pages Deployment

Follow these steps to manually deploy your application to GitHub Pages:

## Prerequisites

1. Make sure you have Git installed and configured with your GitHub credentials
2. Ensure you have a GitHub repository named 'timetables' at github.com/jz1324/timetables

## Deployment Steps

1. **Build the application**:
   ```bash
   cd /Users/joshuazheng/Downloads/Vscode/timetable\ premium
   npm run build
   ```

2. **Create a .nojekyll file** (to prevent Jekyll processing):
   ```bash
   touch build/.nojekyll
   ```

3. **Initialize Git** (if not already done):
   ```bash
   git init
   ```

4. **Add the remote repository** (if not already configured):
   ```bash
   git remote add origin https://github.com/jz1324/timetables.git
   ```

5. **Push to the gh-pages branch**:

   Option 1: Using the gh-pages npm package:
   ```bash
   npm run deploy:github
   ```

   Option 2: Manual push (if gh-pages package has issues):
   ```bash
   git checkout -b gh-pages
   git add -f build/
   git commit -m "Deploy to GitHub Pages"
   git push -f origin gh-pages
   git checkout main
   ```

6. **Verify Deployment**:
   - Wait a few minutes for GitHub Pages to process the deployment
   - Visit https://jz1324.github.io/timetables/ to check your application

## Troubleshooting

1. **Authentication Issues**:
   - If you encounter authentication issues, make sure you have your SSH keys set up or use a GitHub personal access token

2. **404 Errors After Deployment**:
   - Check the GitHub repository settings → Pages to ensure it's set to deploy from the gh-pages branch
   - Make sure the .nojekyll file is present in the root of the deployed site
   - Verify that the HashRouter is being used for GitHub Pages

3. **Missing Resources**:
   - Check the browser console for any missing resources
   - Verify that paths in webpack.config.js are correctly configured with `publicPath: '/timetables/'`

4. **Environment Variables**:
   - Ensure Firebase credentials are properly set up in GitHub repository secrets for CI/CD
   - For manual deployment, make sure .env.production has the necessary variables
