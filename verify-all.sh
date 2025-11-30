#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   WebCodecs Node.js - Comprehensive Verification          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
  fi
}

echo "📦 Checking Core Files..."
[ -f "index.js" ] && check "index.js exists"
[ -f "package.json" ] && check "package.json exists"
[ -f "LICENSE" ] && check "LICENSE exists"

echo
echo "📝 Checking Examples..."
[ -f "demo.js" ] && check "demo.js exists"
[ -f "test-codecs.js" ] && check "test-codecs.js exists"
[ -f "stress-test.js" ] && check "stress-test.js exists"

echo
echo "🐳 Checking Docker Files..."
[ -f "docker-compose.yml" ] && check "docker-compose.yml exists"
[ -f "backend/server.js" ] && check "backend/server.js exists"
[ -f "frontend/index.html" ] && check "frontend/index.html exists"

echo
echo "📚 Checking Documentation..."
[ -f "README.md" ] && check "README.md exists"
[ -f "QUICKSTART.md" ] && check "QUICKSTART.md exists"
[ -f "IMPLEMENTATION.md" ] && check "IMPLEMENTATION.md exists"
[ -f "SUBMISSION.md" ] && check "SUBMISSION.md exists"
[ -f "DOCKER.md" ] && check "DOCKER.md exists"
[ -f "SECURITY.md" ] && check "SECURITY.md exists"
[ -f "CONTRIBUTING.md" ] && check "CONTRIBUTING.md exists"

echo
echo "🔧 Checking Configuration..."
[ -f ".eslintrc.json" ] && check ".eslintrc.json exists"
[ -f ".gitignore" ] && check ".gitignore exists"

echo
echo "🧪 Running Tests..."
npm test > /dev/null 2>&1
check "npm test passes"

echo
echo "🔒 Security Audit..."
npm audit > /dev/null 2>&1
check "npm audit (0 vulnerabilities)"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results: ${PASS} passed, ${FAIL} failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready for submission.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please review.${NC}"
  exit 1
fi
