#!/bin/bash

# PSA Cert Gallery Test Script
# This script tests the new cert gallery features

echo "=================================="
echo "PSA Cert Gallery - Test Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Test cert numbers (from your 19 Eeveelution cards)
TEST_CERTS="116230496,110761155,114363745"

echo "📋 Test Configuration:"
echo "  API Base: $API_BASE"
echo "  Frontend: $FRONTEND_URL"
echo "  Test Certs: $TEST_CERTS"
echo ""

# Test 1: Check if backend is running
echo "Test 1: Backend Health Check"
echo "-----------------------------"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/" 2>/dev/null)
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend not responding (HTTP $response)${NC}"
    echo "  Please start backend: cd backend && npm run dev"
    exit 1
fi
echo ""

# Test 2: Check Firebase cards
echo "Test 2: Firebase Cards Check"
echo "-----------------------------"
cards_response=$(curl -s "$API_BASE/api/cards" 2>/dev/null)
if [ ! -z "$cards_response" ]; then
    card_count=$(echo "$cards_response" | grep -o "cert_number" | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Found $card_count cards in Firebase${NC}"
    
    # Extract first 3 cert numbers if available
    first_certs=$(echo "$cards_response" | grep -o '"cert_number":"[0-9]*"' | head -3 | grep -o '[0-9]*' | tr '\n' ',' | sed 's/,$//')
    if [ ! -z "$first_certs" ]; then
        TEST_CERTS=$first_certs
        echo "  Using certs: $TEST_CERTS"
    fi
else
    echo -e "${YELLOW}⚠ No cards found in Firebase${NC}"
    echo "  Cards will be created during sync"
fi
echo ""

# Test 3: Test new Cert API endpoint (without auth)
echo "Test 3: Cert API Endpoint (No Auth)"
echo "------------------------------------"
cert_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_BASE/api/certs?ids=$TEST_CERTS" 2>/dev/null)
http_code=$(echo "$cert_response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$cert_response" | sed '/HTTP_CODE:/d')

if [ "$http_code" = "401" ]; then
    echo -e "${YELLOW}⚠ Authentication required (as expected)${NC}"
    echo "  Response: $body"
elif [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Cert API responding${NC}"
    echo "$body" | python3 -m json.tool 2>/dev/null | head -20
else
    echo -e "${RED}✗ Unexpected response: HTTP $http_code${NC}"
    echo "  $body"
fi
echo ""

# Test 4: Test image proxy
echo "Test 4: Image Proxy Check"
echo "--------------------------"
test_image="https://via.placeholder.com/400x560"
proxy_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/proxy-image?url=$test_image" 2>/dev/null)
if [ "$proxy_response" = "200" ]; then
    echo -e "${GREEN}✓ Image proxy working${NC}"
else
    echo -e "${RED}✗ Image proxy failed (HTTP $proxy_response)${NC}"
fi
echo ""

# Test 5: Check if sync script exists
echo "Test 5: Sync Script Check"
echo "-------------------------"
if [ -f "./backend/src/seed/syncCerts.js" ]; then
    echo -e "${GREEN}✓ Sync script exists${NC}"
    echo "  Run: cd backend && npm run db:sync-certs"
else
    echo -e "${RED}✗ Sync script not found${NC}"
fi
echo ""

# Test 6: Check frontend files
echo "Test 6: Frontend Components Check"
echo "----------------------------------"
components=(
    "frontend/src/components/CertCard.vue"
    "frontend/src/components/CertGrid.vue"
    "frontend/src/pages/Certs.vue"
    "frontend/src/utils/api.js"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✓ $component${NC}"
    else
        echo -e "${RED}✗ $component not found${NC}"
    fi
done
echo ""

# Test 7: Check route configuration
echo "Test 7: Route Configuration"
echo "---------------------------"
if grep -q "Certs" frontend/src/router/index.js; then
    echo -e "${GREEN}✓ /certs route configured${NC}"
else
    echo -e "${RED}✗ /certs route not found${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "Test Summary"
echo "=================================="
echo ""
echo "Manual Testing Steps:"
echo ""
echo "1. Sync PSA Data (run in backend directory):"
echo "   ${YELLOW}npm run db:sync-certs${NC}"
echo ""
echo "2. Start Frontend (if not running):"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3. Open Browser:"
echo "   ${YELLOW}$FRONTEND_URL/certs${NC}"
echo ""
echo "4. Test with curl (with auth token):"
echo "   ${YELLOW}curl -H \"Authorization: Bearer YOUR_TOKEN\" \\${NC}"
echo "   ${YELLOW}  \"$API_BASE/api/certs?ids=$TEST_CERTS\"${NC}"
echo ""
echo "=================================="

