#!/bin/bash

# 🚀 TicketSphere Production Deployment Script
# This script prepares your application for Render deployment

set -e  # Exit on any error

echo "🚀 Starting TicketSphere Production Deployment Setup..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root directory."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists git; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing all dependencies..."
npm run install:all

# Build client for testing
echo "🏗️  Building client for production test..."
cd client && npm run build
cd ..

echo "✅ Production build test successful"

# Initialize git repository if not exists
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    
    # Create .gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        echo "📝 Creating .gitignore..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Production builds
client/dist/
client/build/

# Environment files (sensitive data)
server/config/firebase-service-account.json

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
    fi
fi

# Add all files to git
echo "📝 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "🚀 Production deployment setup - $(date)"
fi

# Display deployment instructions
echo ""
echo "🎉 DEPLOYMENT SETUP COMPLETE!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/GauravDeep25/TicketSphere.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy on Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Render will auto-deploy using render.yaml"
echo ""
echo "3. Update Firebase Configuration:"
echo "   - Replace placeholder values in render.yaml"
echo "   - Update client/.env with your Firebase config"
echo "   - Update server/.env with your Firebase service account"
echo ""
echo "📚 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "🌟 Your app will be available at:"
echo "   Frontend: https://ticketsphere-frontend.onrender.com"
echo "   API:      https://ticketsphere-api.onrender.com"
echo ""
echo "Happy deploying! 🚀"
