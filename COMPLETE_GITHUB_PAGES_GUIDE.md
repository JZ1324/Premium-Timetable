# Complete GitHub Pages Deployment Guide

This guide provides comprehensive instructions for deploying your Timetable application to GitHub Pages.

## Prerequisites

1. GitHub Account with the repository `jz1324/timetables` created
2. Git installed and configured with your GitHub credentials
3. Node.js and npm installed

## Deployment Options

### Option 1: Manual Deployment with gh-pages tool

This is the recommended approach as it's simple and reliable:

1. **Build the application**:
   ```zsh
   cd /Users/joshuazheng/Downloads/Vscode/timetable\ premium
   npm run build
   ```

2. **Create a .nojekyll file**:
   ```zsh
   touch build/.nojekyll
   ```

3. **Deploy using gh-pages**:
   ```zsh
   # If you have GitHub authentication set up:
   npx gh-pages -d build

   # Or with a custom commit message:
   npx gh-pages -d build -m "Deploy timetable application to GitHub Pages"
   ```

### Option 2: Using git commands manually

If the gh-pages tool isn't working for you:

1. **Build the application**:
   ```zsh
   cd /Users/joshuazheng/Downloads/Vscode/timetable\ premium
   npm run build
   touch build/.nojekyll
   ```

2. **Set up git if not already done**:
   ```zsh
   git init
   git remote add origin https://github.com/jz1324/timetables.git
   ```

3. **Create and push to gh-pages branch**:
   ```zsh
   # Create a temporary gh-pages branch
   git checkout -b gh-pages-temp

   # Add the build folder
   git add -f build/

   # Commit the changes
   git commit -m "Deploy to GitHub Pages"

   # Create the subtree branch (this is the key step)
   git subtree push --prefix build origin gh-pages

   # Return to main branch
   git checkout main
   git branch -D gh-pages-temp
   ```

### Option 3: GitHub Desktop Alternative

If you're having issues with terminal commands:

1. **Build the application** in terminal:
   ```zsh
   cd /Users/joshuazheng/Downloads/Vscode/timetable\ premium
   npm run build
   touch build/.nojekyll
   ```

2. **Use GitHub Desktop**:
   - Open GitHub Desktop
   - Add the local repository
   - Create a new branch called "gh-pages"
   - Stage all changes in the build directory
   - Commit with message "Deploy to GitHub Pages"
   - Push the branch to origin
   - On GitHub website, go to Settings > Pages and select gh-pages branch

## After Deployment

1. **Verify Settings on GitHub**:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Ensure the source is set to "gh-pages branch"
   - Check if a custom domain is configured (should be blank unless you have a custom domain)

2. **Access Your Site**:
   - Your site should be available at: https://jz1324.github.io/timetables/
   - It may take a few minutes for the changes to propagate

3. **Verify Routing Works**:
   - Test direct navigation to different routes
   - Reload pages to ensure they work properly
   - Check browser console for any errors

## Troubleshooting

### 404 Errors
- Ensure the HashRouter is being used for GitHub Pages deployment
- Verify the base path is set correctly in your Router component
- Check for the .nojekyll file in the deployed site

### Missing Resources
- Check for proper paths in webpack.config.js (publicPath setting)
- Ensure all assets are included in the build process
- Verify that CopyWebpackPlugin is copying all necessary files

### Authentication Issues
- Use a Personal Access Token with appropriate permissions
- Try using SSH instead of HTTPS for the repository URL
- Use GitHub Desktop if terminal authentication isn't working

For additional help, refer to:
- GitHub Pages documentation: https://docs.github.com/en/pages
- gh-pages npm package: https://github.com/tschaub/gh-pages
