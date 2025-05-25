#!/bin/bash
# manual-fix-index-html.sh - Script to create a clean index.html file

echo "Creating a corrected index.html file..."

# Make sure build directory exists
if [ ! -d "build" ]; then
  echo "Error: build directory not found"
  exit 1
fi

# Create a corrected index.html file
cat > build/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Customizable Timetable App</title>
    <script src="/path-fix.js"></script>
    <script src="/vercel-path-fix.js"></script>
    <script>
      if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        window.__webpack_public_path__ = "/";
      }
    </script>
    <script src="https://www.gstatic.com/firebasejs/11.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.7.1/firebase-storage-compat.js"></script>
    <script>
      window.firebaseConfig = {
        apiKey: "AIzaSyCUlHCKRwkIpJX0PXc3Nvt_l2HmfJwyjC0",
        authDomain: "timetable-28639.firebaseapp.com",
        projectId: "timetable-28639",
        storageBucket: "timetable-28639.appspot.com",
        messagingSenderId: "653769103112",
        appId: "1:653769103112:web:7b7fe45718bec053843ebd",
        measurementId: "G-J0F10129PJ"
      };
      firebase.initializeApp(window.firebaseConfig);
    </script>
    <script>
      window.__VERCEL_DEPLOYMENT = window.location.hostname.includes("vercel.app") || window.location.hostname.includes("now.sh");
      window.__GITHUB_PAGES = window.location.hostname.includes("github.io");
      window.__NETLIFY_DEPLOYMENT = window.location.hostname.includes("netlify.app");
      window.__PRODUCTION = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
      console.log("[Environment]", {
        hostname: window.location.hostname,
        isVercel: window.__VERCEL_DEPLOYMENT,
        isGitHubPages: window.__GITHUB_PAGES,
        isNetlify: window.__NETLIFY_DEPLOYMENT,
        isProduction: window.__PRODUCTION
      });
    </script>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        transition: background-color .3s ease;
        overscroll-behavior: none;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      try {
        const theme = localStorage.getItem("preferred-theme");
        if (theme) {
          document.documentElement.setAttribute("data-theme", theme);
          document.body.setAttribute("data-theme", theme);
          document.documentElement.className = document.body.className = `theme-${theme}`;
        }
      } catch (e) {}
    </script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (window.__VERCEL_DEPLOYMENT) {
          document.querySelectorAll('script[src*="bundle.js"]').forEach(script => {
            if (script.src.includes("./bundle.js")) {
              script.src = "/bundle.js";
            }
          });
          console.log("Adjusted bundle.js path for Vercel deployment");
        }
      });
    </script>
    <script defer="defer" src="/bundle.js"></script>
  </body>
</html>
EOF

echo "✅ Created manually corrected index.html file"
echo "The original file has been preserved as build/index.html.bak"
