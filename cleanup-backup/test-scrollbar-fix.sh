#!/bin/bash

# Test script for scrollbar fix
echo "🔍 Testing the scrollbar fix in the Premium Timetable application"
echo "═════════════════════════════════════════════════════════"
echo ""

# Check if the development server is running
if ! nc -z localhost 3000 &>/dev/null; then
  echo "⚠️ Development server is not running. Starting it now..."
  echo "Starting development server in a new terminal window..."
  osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && npm start"'
  
  echo "⏳ Waiting for server to start (30 seconds)..."
  for i in {1..30}; do
    if nc -z localhost 3000 &>/dev/null; then
      echo "✅ Server started successfully!"
      break
    fi
    sleep 1
    echo -n "."
    if [ $i -eq 30 ]; then
      echo "❌ Server failed to start in time. Please start manually with 'npm start'"
      exit 1
    fi
  done
else
  echo "✅ Development server is already running"
fi

echo ""
echo "🧪 Test Procedure:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to the timetable view and verify:"
echo "   - No vertical scrollbar is visible on the right side"
echo "   - Scrolling functionality still works with mouse/trackpad"
echo "   - Mobile view has no horizontal scrollbar for period labels"
echo "3. Try different themes to verify the fix works in all themes"
echo ""
echo "📱 To test mobile view:"
echo "   - Use Chrome DevTools (F12) and toggle device toolbar (Ctrl+Shift+M)"
echo "   - Select a mobile device and verify no scrollbars appear"
echo ""
echo "✅ If all tests pass, the scrollbar fix is working correctly!"
echo ""
echo "To stop the development server when done testing, press Ctrl+C in the terminal window running the server."
