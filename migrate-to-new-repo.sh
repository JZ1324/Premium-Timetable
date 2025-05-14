#!/bin/zsh

# Script to change the remote repository and push all code to the new repository
CURRENT_REPO="https://github.com/JZ1324/timetables.git"
NEW_REPO="https://github.com/JZ1324/Premium-Timetable.git"

echo "🔄 Changing remote repository from $CURRENT_REPO to $NEW_REPO"

# Check if git is initialized
if [ ! -d .git ]; then
  echo "❌ Git repository not initialized. Initializing git..."
  git init
fi

# Check current remote
CURRENT_REMOTE=$(git remote -v | grep origin | head -n 1 | awk '{print $2}')

if [ -z "$CURRENT_REMOTE" ]; then
  echo "No origin remote found. Adding new origin..."
  git remote add origin "$NEW_REPO"
else
  echo "Current remote: $CURRENT_REMOTE"
  echo "Updating origin to point to new repository..."
  git remote set-url origin "$NEW_REPO"
fi

# Verify the change
echo "✅ New remote configuration:"
git remote -v

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  CURRENT_BRANCH="main"
  echo "No current branch detected. Using '$CURRENT_BRANCH'."
else
  echo "Current branch: $CURRENT_BRANCH"
fi

# Stage all files
echo "📦 Staging all files..."
git add .

# Commit changes if there are any
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  echo "💾 Committing changes..."
  git commit -m "Migration to new repository: Premium-Timetable"
fi

# Push to the new repository
echo "🚀 Pushing to new repository..."
git push -u origin "$CURRENT_BRANCH"

# Check if we need to push other branches
OTHER_BRANCHES=$(git branch | grep -v "$CURRENT_BRANCH" | tr -d ' *')
if [ -n "$OTHER_BRANCHES" ]; then
  echo "📋 Found other branches: $OTHER_BRANCHES"
  echo "Would you like to push these branches as well? (y/n)"
  read push_others
  
  if [[ $push_others == "y" || $push_others == "Y" ]]; then
    for branch in $OTHER_BRANCHES; do
      echo "🔄 Pushing branch $branch..."
      git checkout "$branch"
      git push -u origin "$branch"
    done
    
    # Return to original branch
    git checkout "$CURRENT_BRANCH"
  fi
fi

echo "✅ Repository migration complete!"
echo "🌐 Your code is now available at: $NEW_REPO"
echo "📊 GitHub Pages will be available at: https://jz1324.github.io/Premium-Timetable/"
