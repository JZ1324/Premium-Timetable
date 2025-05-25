#!/bin/bash
# github-to-vercel.sh - Script to prepare and push to GitHub for Vercel deployment

# Print colorful messages
print_info() {
  echo -e "\033[36m[INFO] $1\033[0m"
}

print_success() {
  echo -e "\033[32m[SUCCESS] $1\033[0m"
}

print_warning() {
  echo -e "\033[33m[WARNING] $1\033[0m"
}

print_error() {
  echo -e "\033[31m[ERROR] $1\033[0m"
}

print_info "Starting GitHub deployment preparation..."

# Fix the webpack "run" module error
print_info "Fixing webpack 'run' module error..."
bash ./fix-webpack-run-error.sh

# Verify that the webpack config has the alias
if ! grep -q "'run': path.resolve" webpack.config.js; then
  print_error "Failed to fix webpack config. Please check webpack.config.js manually."
  exit 1
fi

# Ensure all required files exist
print_info "Verifying essential files..."
files_to_check=(
  "src/utils/empty.js"
  "webpack.config.js"
  "vercel.json"
  "package.json"
)

for file in "${files_to_check[@]}"; do
  if [ ! -f "$file" ]; then
    print_error "Missing essential file: $file"
    exit 1
  else
    print_info "Found: $file"
  fi
done

# Make sure we have the proper .gitignore
if [ ! -f ".gitignore" ]; then
  print_info "Creating .gitignore file..."
  cat > .gitignore << 'EOF'
node_modules
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
service-account-key.json
.vercel

# Build outputs
build/*
!build/.gitkeep

# Debug files
*.log
*.bak
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE files
.idea
.vscode
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Temporary files
.tmp
*.tmp
*~
EOF
  print_success "Created .gitignore file"
else
  print_info ".gitignore file already exists"
fi

# Create a build directory placeholder for git
mkdir -p build
touch build/.gitkeep

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  print_warning "Not a git repository. Initializing..."
  git init
  print_info "Git repository initialized"
fi

# Check if the remote is set up
if ! git remote -v | grep -q "github.com/JZ1324/Premium-Timetable.git"; then
  print_info "Setting up GitHub remote..."
  git remote add origin https://github.com/JZ1324/Premium-Timetable.git
  print_success "GitHub remote added"
else
  print_info "GitHub remote already set up"
fi

# Stage all changes
print_info "Staging changes..."
git add -A

# Ask for commit message
print_info "Please enter a commit message:"
read -p "> " commit_message

if [ -z "$commit_message" ]; then
  commit_message="Update timetable application with Vercel deployment fixes"
fi

# Commit changes
print_info "Committing changes..."
git commit -m "$commit_message"

# Push to GitHub
print_info "Pushing to GitHub..."
git push -u origin master || git push -u origin main

push_status=$?
if [ $push_status -eq 0 ]; then
  print_success "Successfully pushed to GitHub!"
  print_info "Next steps:"
  print_info "1. Go to Vercel (https://vercel.com)"
  print_info "2. Import your repository (https://github.com/JZ1324/Premium-Timetable)"
  print_info "3. Set the Build Command to 'npm run build'"
  print_info "4. Set the Output Directory to 'build'"
  print_info "5. Click Deploy"
else
  print_error "Failed to push to GitHub. Please check your permissions and try again."
  print_info "You can manually push with: git push -u origin main"
fi
