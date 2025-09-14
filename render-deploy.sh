#!/bin/bash

# TicketSphere Render Deployment Script
# Run this script to prepare your app for Render deployment

echo "🚀 Preparing TicketSphere for Render Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create deployment checklist
echo "📋 Deployment Checklist:"
echo ""

# Check if .gitignore excludes sensitive files
if grep -q ".env" .gitignore; then
    echo "✅ .env files are excluded from Git"
else
    echo "❌ WARNING: .env files may be included in Git!"
fi

# Check if Firebase key is excluded
if grep -q "firebase-service-account.json" .gitignore; then
    echo "✅ Firebase service account key is excluded from Git"
else
    echo "❌ WARNING: Firebase key may be included in Git!"
fi

# Validate package.json files exist
if [ -f "server/package.json" ]; then
    echo "✅ Server package.json found"
else
    echo "❌ Server package.json missing"
fi

if [ -f "client/package.json" ]; then
    echo "✅ Client package.json found"
else
    echo "❌ Client package.json missing"
fi

# Check if render.yaml exists
if [ -f "render.yaml" ]; then
    echo "✅ Render configuration file found"
else
    echo "❌ render.yaml not found"
fi

echo ""
echo "📝 Next Steps for Render Deployment:"
echo "1. Push your code to GitHub (sensitive files are already excluded)"
echo "2. Go to https://render.com and create a new account"
echo "3. Connect your GitHub repository"
echo "4. Use the render.yaml file for automatic deployment OR"
echo "5. Create services manually:"
echo "   - Backend: Web Service (Node.js)"
echo "   - Frontend: Static Site"
echo ""
echo "🔐 Environment Variables to Set in Render Dashboard:"
echo "Backend:"
echo "- MONGODB_URI"
echo "- JWT_SECRET"
echo "- FRONTEND_URL (use your frontend Render URL)"
echo "- UPI_ID"
echo ""
echo "Frontend:"
echo "- VITE_API_URL (use your backend Render URL + /api)"
echo "- VITE_FIREBASE_* (your Firebase config values)"
echo ""
echo "📄 See RENDER-REQUIREMENTS.md for detailed instructions"
echo ""
echo "🎉 Your app is ready for Render deployment!"
