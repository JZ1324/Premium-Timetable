# GitHub Pages Deployment Verification

Use this checklist to verify that your GitHub Pages deployment is working correctly.

## 1. Check Repository Settings

- [ ] Go to your repository: https://github.com/jz1324/timetables
- [ ] Navigate to Settings > Pages
- [ ] Verify source is set to "gh-pages branch" (not master/main)
- [ ] Note the published URL (should be https://jz1324.github.io/timetables/)

## 2. Check for Deployed Files

- [ ] Visit https://jz1324.github.io/timetables/.nojekyll
  - This should either download or show a blank page if the .nojekyll file is present
- [ ] Visit https://jz1324.github.io/timetables/index.html
  - This should load your app's main page

## 3. Test Routing

- [ ] Visit https://jz1324.github.io/timetables/ (main page)
- [ ] Try navigating to other pages within the app
- [ ] Try directly accessing a route, like https://jz1324.github.io/timetables/#/settings
- [ ] Refresh the page while on a route to test if it maintains the route

## 4. Check for Errors

- [ ] Open browser developer tools (F12 or Right-click > Inspect)
- [ ] Check the Console tab for any errors
- [ ] Check the Network tab for any failed requests (red items)
- [ ] Try loading the site in Incognito/Private mode to rule out cache issues

## 5. Common Fixes

If you're still encountering issues:

### 404 Page Not Found
- Ensure .nojekyll file is in the root of the gh-pages branch
- Verify that HashRouter is being used in src/components/Router.js
- Check if the repository name matches the publicPath in webpack.config.js

### Missing Resources
- Check if paths are relative or absolute in your code
- Verify that all resources are copied by the build process
- Check webpack's publicPath configuration

### Routing Issues
- Ensure Router.js is using HashRouter for GitHub Pages 
- Confirm routes are set up correctly in the React Router configuration
- Test with # in URLs: https://jz1324.github.io/timetables/#/your-route

## 6. Deployment Commands

If you need to redeploy, use one of these methods:

```bash
# Using the provided script
./deploy-to-github-pages.sh

# Using gh-pages directly
npm run build
touch build/.nojekyll
npx gh-pages -d build
```
