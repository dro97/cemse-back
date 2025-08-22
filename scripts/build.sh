#!/bin/sh
set -e

echo "🔍 Checking environment..."
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

echo ""
echo "📦 Generating Prisma client..."
npx prisma generate

echo ""
echo "🔧 Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json found"
    cat tsconfig.json
else
    echo "❌ tsconfig.json not found!"
    exit 1
fi

echo ""
echo "🏗️ Building TypeScript..."
npx tsc --project tsconfig.json

echo ""
echo "✅ Build completed successfully!"
echo "Output directory contents:"
ls -la dist/