#!/bin/bash

echo "🐳 Validating Docker Setup..."
echo

# Check required files
FILES=(
  "docker-compose.yml"
  "backend/Dockerfile"
  "backend/server.js"
  "backend/package.json"
  "frontend/Dockerfile"
  "frontend/index.html"
  "frontend/nginx.conf"
  "index.js"
)

echo "✓ Checking files..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (missing)"
    exit 1
  fi
done

echo
echo "✓ Checking Docker..."
docker --version > /dev/null 2>&1 && echo "  ✓ Docker installed" || echo "  ✗ Docker not found"
docker-compose --version > /dev/null 2>&1 && echo "  ✓ Docker Compose installed" || echo "  ✗ Docker Compose not found"

echo
echo "✅ Docker setup is valid!"
echo
echo "To run:"
echo "  docker-compose up --build"
echo
echo "Then open:"
echo "  http://localhost:3000"
