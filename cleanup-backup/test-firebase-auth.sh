#!/bin/zsh

# Firebase Authentication Setup Test Script

echo "Testing Firebase Authentication Setup..."

# Install Firebase Tools if not already installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Build the React app
echo "Building the React application..."
npm run build

# Create a dedicated testing directory
mkdir -p firebase-test/build
cp -r build/* firebase-test/build/

# Initialize Firebase local server
cd firebase-test
cat > firebase.json << EOF
{
  "hosting": {
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
EOF

# Start Firebase local server
echo "Starting Firebase local server..."
firebase serve --only hosting

echo "Firebase Authentication test server started!"
