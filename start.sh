#!/bin/bash

echo "🚀 Starting TicketSphere Full Stack Application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}Warning: Port $1 is already in use${NC}"
        # Kill processes on the port
        echo -e "${YELLOW}Killing processes on port $1...${NC}"
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Navigate to project root
cd "$(dirname "$0")"

echo -e "${BLUE}📁 Project directory: $(pwd)${NC}"

# Check if we're in development or production mode
if [ "$1" == "production" ]; then
    echo -e "${GREEN}🏗️  Building frontend for production...${NC}"
    cd client
    npm run build
    cd ..
    
    echo -e "${GREEN}🖥️  Starting server in production mode...${NC}"
    cd server
    NODE_ENV=production npm start
else
    echo -e "${YELLOW}🔧 Starting in development mode...${NC}"
    
    # Check and kill processes on common ports
    check_port 3000
    check_port 5000
    check_port 5173
    check_port 5174
    check_port 5175
    check_port 5176
    
    # Install dependencies if needed
    echo -e "${BLUE}📦 Checking dependencies...${NC}"
    
    if [ ! -d "server/node_modules" ]; then
        echo -e "${YELLOW}Installing server dependencies...${NC}"
        cd server && npm install && cd ..
    fi
    
    if [ ! -d "client/node_modules" ]; then
        echo -e "${YELLOW}Installing client dependencies...${NC}"
        cd client && npm install && cd ..
    fi
    
    # Start both frontend and backend
    echo -e "${GREEN}🚀 Starting both frontend and backend...${NC}"
    cd server
    npm run dev:full
fi
