#!/bin/bash

# Server Build Script for Render Deployment
echo "🏗️  Starting server build process..."

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Server build completed successfully!"
else
    echo "❌ Server build failed!"
    exit 1
fi

echo "🚀 Server is ready for deployment!"
