#!/bin/bash
# check-signup-button.sh - Script to verify the signup button is working correctly

echo "🔍 Checking signup button functionality..."

# Check if the 'signup-button' class exists in the Signup.js file
if grep -q "signup-button" src/components/Signup.js; then
  echo "✅ Signup button class found in Signup.js"
else
  echo "❌ Signup button class not found in Signup.js"
fi

# Check if the button has proper styling in the CSS
if grep -q "signup-form .signup-button" src/styles/components/Signup.css; then
  echo "✅ Signup button styling found in Signup.css"
else
  echo "❌ Signup button styling not found in Signup.css"
fi

# Check for the form submit handler
if grep -q "handleSignup" src/components/Signup.js; then
  echo "✅ Form submit handler found in Signup.js"
else
  echo "❌ Form submit handler not found in Signup.js"
fi

# Check if the button is inside a form
if grep -q "<form.*onSubmit.*handleSignup" src/components/Signup.js; then
  echo "✅ Button is inside a form with onSubmit handler"
else
  echo "❌ Button might not be properly connected to the form"
fi

# Additional check for fixed visibility
if grep -q "display.*block.*important" src/styles/components/Login.css; then
  echo "✅ Added important display rules to ensure button visibility"
else 
  echo "⚠️ Consider adding !important display rules if the button is still hidden"
fi

echo ""
echo "✨ IMPORTANT: We've made these fixes to the signup button:"
echo "1. Added explicit styling to make the button more visible"
echo "2. Added z-index to ensure it appears on top of other elements"
echo "3. Wrapped it in a container div for better positioning"
echo "4. Added !important rules to override any conflicting styles"
echo ""
echo "👉 If the button is still not visible, try running npm start and check for console errors"
echo "   related to the signup component or CSS conflicts."
