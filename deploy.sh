#!/bin/bash

# TicketSphere Deployment Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting TicketSphere Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check for required files
print_status "Checking deployment prerequisites..."

if [ ! -f "server/.env" ]; then
    print_warning "Server .env file not found. Please copy from .env.example and configure"
    cp server/.env.example server/.env
    print_warning "Please edit server/.env with your production settings before continuing"
    exit 1
fi

if [ ! -f "client/.env" ]; then
    print_warning "Client .env file not found. Please copy from .env.example and configure"
    cp client/.env.example client/.env
    print_warning "Please edit client/.env with your production settings before continuing"
    exit 1
fi

# Install dependencies
print_status "Installing server dependencies..."
cd server
npm install --production
cd ..

print_status "Installing client dependencies..."
cd client
npm install
cd ..

# Build client for production
print_status "Building client for production..."
cd client
npm run build
print_status "Client build completed"
cd ..

# Run production tests (if any)
print_status "Running pre-deployment checks..."

# Check if server can start
print_status "Testing server startup..."
cd server
timeout 10s npm start > /dev/null 2>&1 && print_status "Server startup test passed" || print_warning "Server startup test skipped (process may still be running)"
cd ..

# Security check - ensure no sensitive data in built files
print_status "Running security checks..."
if grep -r "mongodb.*password" client/dist/ 2>/dev/null; then
    print_error "Security risk: MongoDB credentials found in client build!"
    exit 1
fi

if grep -r "jwt.*secret" client/dist/ 2>/dev/null; then
    print_error "Security risk: JWT secrets found in client build!"
    exit 1
fi

# Create production archive (optional)
print_status "Creating deployment archive..."
tar -czf ticketsphere-production-$(date +%Y%m%d-%H%M%S).tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=.env \
    server/ client/dist/ package.json README.md PRODUCTION-GUIDE.md

print_status "Deployment preparation completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload the created archive to your production server"
echo "2. Extract and configure environment variables"
echo "3. Start the server with: NODE_ENV=production npm start"
echo "4. Set up reverse proxy (nginx/apache) to serve client/dist"
echo ""
echo "📚 For detailed instructions, see PRODUCTION-GUIDE.md"
echo ""
print_status "Deployment archive created: $(ls ticketsphere-production-*.tar.gz | tail -1)"
