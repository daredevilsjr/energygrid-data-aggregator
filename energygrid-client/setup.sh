#!/bin/bash

# EnergyGrid Client Setup Script

echo "⚡ EnergyGrid Data Aggregator - Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v14 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
echo ""

# Run tests
echo "🧪 Running unit tests..."
node test.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure the mock API server is running:"
echo "      cd mock-api && npm install && npm start"
echo ""
echo "   2. In a new terminal, run the client:"
echo "      npm start"
echo ""
echo "   3. Check the output/ directory for results"
echo "================================================"
