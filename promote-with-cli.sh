#!/bin/bash

# Script to promote the most recent deployment to production using Vercel CLI

echo "Logging in to Vercel (if not already logged in)..."
vercel login

echo "Listing recent deployments for premium-timetable..."
vercel ls premium-timetable

echo ""
echo "To promote the most recent deployment to production, copy the deployment ID (first column)"
echo "and then run the following command:"
echo "vercel promote <deployment-id>"
echo ""
echo "Example: vercel promote dpl_abcdefghijklmnopqrstuvwxyz"
echo ""
echo "After promotion, wait a few minutes and then check premium-timetable.vercel.app"
