#!/bin/bash

# Deploy to Firebase hosting with the specific site ID
echo "Building application..."
npm run build

echo "Deploying to Firebase hosting (site ID: timetable-28639-f04f7)..."
firebase target:apply hosting timetable timetable-28639-f04f7
firebase deploy --only hosting:timetable

echo "Deployment complete! Your application is now available at https://timetable-28639-f04f7.web.app"
