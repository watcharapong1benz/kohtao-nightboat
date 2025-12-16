#!/bin/bash

echo "🚀 Ko Tao Night Boat - Deployment Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Navigate to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}📂 Project root: $PROJECT_ROOT${NC}"

# Install server dependencies
echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install

# Setup database
echo -e "${YELLOW}🗄️  Setting up database...${NC}"
npx prisma generate
npx prisma db push

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    npm run seed
fi

# Start server with PM2
echo -e "${YELLOW}🚀 Starting server with PM2...${NC}"
pm2 delete kohtao-server 2>/dev/null || true
pm2 start index.js --name kohtao-server
pm2 save

# Install client dependencies
echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd ../client
npm install

# Build client
echo -e "${YELLOW}🏗️  Building client...${NC}"
npm run build

echo ""
echo -e "${GREEN}=========================================="
echo -e "✅ Deployment completed successfully!"
echo -e "==========================================${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Configure your web server (Nginx/Apache) to serve client/dist"
echo "2. Point API requests to http://localhost:3001"
echo "3. Update client/.env with production API URL"
echo ""
echo "🔧 Useful commands:"
echo "  pm2 status          - Check server status"
echo "  pm2 logs kohtao-server - View server logs"
echo "  pm2 restart kohtao-server - Restart server"
echo "  pm2 stop kohtao-server - Stop server"
echo ""
echo "🌐 Server is running on: http://localhost:3001"
echo "📁 Client build is in: $PROJECT_ROOT/client/dist"
echo ""
