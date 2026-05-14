#!/bin/bash
# Test Script for User Management System

echo "🔄 Waiting for servers to start..."
sleep 15

echo ""
echo "📡 Testing Backend API..."

# Get admin token first
echo ""
echo "1️⃣  Getting Admin Token..."
loginResponse=$(curl -s -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@church.local","password":"admin123"}')

token=$(echo $loginResponse | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$token" ]; then
  echo "✅ Login successful"
  echo "Token: ${token:0:20}..."
else
  echo "❌ Login failed"
  exit 1
fi

# Test 1: Fetch all users
echo ""
echo "2️⃣  Fetching all users..."
usersResponse=$(curl -s "http://localhost:3001/api/users?limit=100" \
  -H "Authorization: Bearer $token")

echo "API Response:"
echo "$usersResponse" | jq '.'

# Test 2: Fetch statistics
echo ""
echo "3️⃣  Fetching user statistics..."
statsResponse=$(curl -s "http://localhost:3001/api/users/stats" \
  -H "Authorization: Bearer $token")

echo "Statistics:"
echo "$statsResponse" | jq '.data'

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✨ USER MANAGEMENT SYSTEM TEST COMPLETE ✨"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🚀 Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Login with admin@church.local / admin123"
echo "  3. Navigate to Users page (/users)"
echo "  4. You should see all users and statistics"
echo "  5. Try creating, editing, or deleting users"

