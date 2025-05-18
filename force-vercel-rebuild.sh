#!/bin/bash
# force-vercel-rebuild.sh
# This script helps force a clean rebuild on Vercel by making a small change to trigger a new deployment

# Change the current timestamp into the codebase to force a rebuild
echo "// Force rebuild timestamp: $(date)" > src/force-rebuild-timestamp.js
echo "// This file exists solely to trigger a Vercel rebuild when nothing else has changed" >> src/force-rebuild-timestamp.js
echo "export const FORCE_REBUILD_TIMESTAMP = '$(date)';" >> src/force-rebuild-timestamp.js

# Create a reference to the file in the entry point
if ! grep -q "force-rebuild-timestamp" src/index.js; then
  echo "" >> src/index.js
  echo "// Import rebuild timestamp to ensure it's included in bundle" >> src/index.js
  echo "import { FORCE_REBUILD_TIMESTAMP } from './force-rebuild-timestamp';" >> src/index.js
  echo "console.log('Build timestamp:', FORCE_REBUILD_TIMESTAMP);" >> src/index.js
fi

# Add and commit the changes
git add src/force-rebuild-timestamp.js src/index.js
git commit -m "Force Vercel rebuild with timestamp $(date)"

# Push changes to trigger Vercel deployment
git push

echo "Changes pushed to repository. Vercel should start a new build shortly."
echo "Once complete, go to your Vercel dashboard and promote the new preview deployment to production."
