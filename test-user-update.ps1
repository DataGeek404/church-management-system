# Test User Update Fix

# 1. Login and get token
Write-Host "🔐 Logging in as admin..." -ForegroundColor Green
$loginResponse = @{
    email = "admin@church.local"
    password = "admin123"
} | ConvertTo-Json

$loginResult = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginResponse

$loginData = $loginResult.Content | ConvertFrom-Json
$token = $loginData.token

Write-Host "✅ Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Green

# 2. Get list of users
Write-Host "`n👥 Fetching users list..." -ForegroundColor Green
$usersResult = Invoke-WebRequest -Uri "http://localhost:3001/api/users?limit=100" `
    -Method GET `
    -Headers @{"Authorization" = "Bearer $token"}

$usersData = $usersResult.Content | ConvertFrom-Json
$testUser = $usersData.data[0]
Write-Host "✅ Found user: $($testUser.firstName) $($testUser.lastName) (ID: $($testUser.id))" -ForegroundColor Green

# 3. Test Update User WITHOUT password (should work)
Write-Host "`n📝 Testing user update (WITHOUT password)..." -ForegroundColor Cyan
$updateData = @{
    firstName = "Updated_$($testUser.firstName)"
    lastName = "$($testUser.lastName)_Modified"
    role = "staff"
} | ConvertTo-Json

try {
    $updateResult = Invoke-WebRequest -Uri "http://localhost:3001/api/users/$($testUser.id)" `
        -Method PUT `
        -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} `
        -Body $updateData

    $updateResponse = $updateResult.Content | ConvertFrom-Json
    Write-Host "✅ USER UPDATE SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($updateResponse.message)" -ForegroundColor Green
    Write-Host "Updated User: $($updateResponse.data | ConvertTo-Json)" -ForegroundColor Green
}
catch {
    Write-Host "❌ USER UPDATE FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# 4. Verify the update
Write-Host "`n🔍 Verifying update..." -ForegroundColor Cyan
try {
    $verifyResult = Invoke-WebRequest -Uri "http://localhost:3001/api/users/$($testUser.id)" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}

    $verifyData = $verifyResult.Content | ConvertFrom-Json
    Write-Host "✅ Current user data:" -ForegroundColor Green
    Write-Host $verifyData.data | ConvertTo-Json
}
catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Test Complete!" -ForegroundColor Cyan

