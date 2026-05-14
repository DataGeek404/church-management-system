# Test Script for User Management System
# This script tests all user management endpoints

Write-Host "🔄 Waiting for servers to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "`n📡 Testing Backend API..." -ForegroundColor Yellow

# Get admin token first
Write-Host "`n1️⃣  Getting Admin Token..." -ForegroundColor Cyan
$loginResponse = curl.exe -s -X POST "http://localhost:3001/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@church.local","password":"admin123"}' | ConvertFrom-Json

if ($loginResponse.success) {
  Write-Host "✅ Login successful" -ForegroundColor Green
  $token = $loginResponse.token
  Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} else {
  Write-Host "❌ Login failed" -ForegroundColor Red
  exit 1
}

# Test 1: Fetch all users
Write-Host "`n2️⃣  Fetching all users..." -ForegroundColor Cyan
$usersResponse = curl.exe -s "http://localhost:3001/api/users?limit=100" `
  -H "Authorization: Bearer $token" | ConvertFrom-Json

if ($usersResponse.success) {
  Write-Host "✅ Users fetched successfully" -ForegroundColor Green
  Write-Host "📊 Total users: $($usersResponse.total)" -ForegroundColor Cyan
  Write-Host "📋 Users in response: $($usersResponse.data.Count)" -ForegroundColor Cyan
  $usersResponse.data | ForEach-Object {
    Write-Host "  - $($_.firstName) $($_.lastName) ($($_.email)) - Role: $($_.role), Status: $($_.status)"
  }
} else {
  Write-Host "❌ Failed to fetch users" -ForegroundColor Red
}

# Test 2: Fetch statistics
Write-Host "`n3️⃣  Fetching user statistics..." -ForegroundColor Cyan
$statsResponse = curl.exe -s "http://localhost:3001/api/users/stats" `
  -H "Authorization: Bearer $token" | ConvertFrom-Json

if ($statsResponse.success) {
  Write-Host "✅ Statistics fetched successfully" -ForegroundColor Green
  $stats = $statsResponse.data
  Write-Host "  📊 Total Users: $($stats.total)" -ForegroundColor Cyan
  Write-Host "  ✅ Active Users: $($stats.active)" -ForegroundColor Green
  Write-Host "  👤 Admins: $($stats.admins)" -ForegroundColor Red
  Write-Host "  👨‍💼 Staff: $($stats.staff)" -ForegroundColor Yellow
  Write-Host "  👥 Members: $($stats.members)" -ForegroundColor Blue
} else {
  Write-Host "❌ Failed to fetch statistics" -ForegroundColor Red
}

# Test 3: Create a new user
Write-Host "`n4️⃣  Creating a new user..." -ForegroundColor Cyan
$newUserData = @{
  firstName = "Test"
  lastName = "User"
  email = "testuser@church.local"
  password = "test123456"
  role = "member"
} | ConvertTo-Json

$createResponse = curl.exe -s -X POST "http://localhost:3001/api/users" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d $newUserData | ConvertFrom-Json

if ($createResponse.success) {
  Write-Host "✅ User created successfully" -ForegroundColor Green
  Write-Host "  🆔 New User ID: $($createResponse.data.id)" -ForegroundColor Cyan
  $newUserId = $createResponse.data.id
} else {
  Write-Host "❌ Failed to create user: $($createResponse.message)" -ForegroundColor Red
}

# Test 4: Fetch users with search filter
Write-Host "`n5️⃣  Testing search filter..." -ForegroundColor Cyan
$searchResponse = curl.exe -s "http://localhost:3001/api/users?search=test&limit=100" `
  -H "Authorization: Bearer $token" | ConvertFrom-Json

if ($searchResponse.success) {
  Write-Host "✅ Search filter working" -ForegroundColor Green
  Write-Host "  🔍 Found $($searchResponse.data.Count) users matching 'test'" -ForegroundColor Cyan
} else {
  Write-Host "❌ Search filter failed" -ForegroundColor Red
}

# Test 5: Frontend connection
Write-Host "`n6️⃣  Testing Frontend Connection..." -ForegroundColor Cyan
$frontendCheck = curl.exe -s -w "%{http_code}" "http://localhost:3000" -o $null

if ($frontendCheck -eq "200") {
  Write-Host "✅ Frontend is running on http://localhost:3000" -ForegroundColor Green
} else {
  Write-Host "⚠️  Frontend may still be loading (status: $frontendCheck)" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ USER MANAGEMENT SYSTEM TEST COMPLETE ✨" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  2. Login with admin@church.local / admin123" -ForegroundColor White
Write-Host "  3. Navigate to Users page (/users)" -ForegroundColor White
Write-Host "  4. You should see all users and statistics" -ForegroundColor White
Write-Host "  5. Try creating, editing, or deleting users" -ForegroundColor White

