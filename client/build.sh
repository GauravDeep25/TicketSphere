#!/bin/bash

# Client Build Script for Render Static Site Deployment
echo "🏗️  Starting client build process..."

# Install client dependencies
echo "📦 Installing client dependencies..."
npm install

# Build the React application
echo "🔨 Building React application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Client build completed successfully!"
    echo "📁 Static files are in ./dist/ directory"
else
    echo "❌ Client build failed!"
    exit 1
fi

echo "🚀 Client is ready for static site deployment!"
