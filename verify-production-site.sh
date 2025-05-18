#!/bin/bash

# Script to verify that the production site is working properly after promotion

PRODUCTION_URL="https://premium-timetable.vercel.app"
PREVIEW_URL="https://premium-timetable-git-main-jzs-projects-88f4a016.vercel.app"

echo "Checking production site: $PRODUCTION_URL"
echo "--------------------------------------------"
echo "This script can help verify if your promotion to production was successful."
echo "It doesn't actually check the site automatically - you should visit both URLs"
echo "in your browser and verify that the production site no longer shows the error:"
echo "Uncaught (in promise) TypeError: n[e] is not a function"
echo ""
echo "Production URL: $PRODUCTION_URL"
echo "Preview URL (known working): $PREVIEW_URL"
echo ""
echo "After promoting in the Vercel dashboard, wait a few minutes for changes to propagate"
echo "before checking the production site."
echo ""
echo "If the production site still shows errors after waiting 5-10 minutes:"
echo "1. Try clearing your browser cache or using a private/incognito window"
echo "2. Check if the promotion completed successfully in the Vercel dashboard"
echo "3. If needed, trigger a new deployment with ./force-vercel-rebuild.sh"
