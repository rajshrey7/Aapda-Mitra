#!/bin/bash

echo "🛡️ Aapda Mitra - Setup Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v14 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check npm installation
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) found${NC}"

# Check MongoDB installation
echo "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB is not installed or not in PATH.${NC}"
    echo "Please ensure MongoDB is installed and running."
else
    echo -e "${GREEN}✓ MongoDB found${NC}"
fi

echo ""
echo "Installing dependencies..."
echo "=========================="

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo ""
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo ""
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f server/.env ]; then
    echo ""
    echo "Creating .env file..."
    cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aapda-mitra
JWT_SECRET=aapda_mitra_sih_2024_secret_key_punjab
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
EOL
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please update the OPENAI_API_KEY in server/.env${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "To start the application:"
echo "========================="
echo "1. Start MongoDB: mongod"
echo "2. In one terminal: cd server && npm start"
echo "3. In another terminal: cd client && npm start"
echo ""
echo "Or use: npm run dev (requires concurrently)"
echo ""
echo "The application will be available at:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Happy coding! 🚀"