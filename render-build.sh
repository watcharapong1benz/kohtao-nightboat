#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing root dependencies..."
# If you had root dependencies, you'd install them here. 
# Since we don't have a package.json in the root (based on list_dir), we skip.

echo "Installing client dependencies..."
cd client
npm install

echo "Building client..."
export VITE_API_URL=""
npm run build
cd ..

echo "Installing server dependencies..."
cd server
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Build complete."
