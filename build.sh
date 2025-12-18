# Build script for Render.com
echo "Building client..."
cd client
npm install
npm run build
cd ..

echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "Build complete!"
