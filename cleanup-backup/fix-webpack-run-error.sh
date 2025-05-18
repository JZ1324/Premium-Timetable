#!/bin/bash
# fix-webpack-run-error.sh - Script to fix the "Can't resolve 'run'" webpack error

echo "🔧 Fixing webpack 'run' module resolution error..."

# Create utils directory if it doesn't exist
mkdir -p src/utils

# Create empty.js file
cat > src/utils/empty.js << 'EOF'
// empty.js - This file exists to satisfy the webpack resolver
// It's used as an alias for the 'run' module that can't be found
export default {};
EOF

echo "✅ Created src/utils/empty.js as a placeholder for the 'run' module"

# Check if webpack.config.js contains the alias already
if grep -q "'run': path.resolve" webpack.config.js; then
  echo "✅ webpack.config.js already has the 'run' alias"
else
  echo "🔧 Adding 'run' alias to webpack.config.js..."
  # Make a backup of webpack.config.js
  cp webpack.config.js webpack.config.js.bak
  
  # Add the alias to the resolve section
  sed -i '' 's/  resolve: {/  resolve: {\n    alias: {\n      '\''run'\'': path.resolve(__dirname, '\''src\/utils\/empty.js'\'')\n    },/g' webpack.config.js
  
  echo "✅ Added 'run' alias to webpack.config.js"
fi

echo "✅ Module resolution error fix complete!"
echo "🚀 Now you can build your project without the 'Can't resolve run' error"
