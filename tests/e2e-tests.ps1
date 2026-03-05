# ============================================
# E2E Test Script for SaaS Subscription Management
# Run with PowerShell: .\e2e-tests.ps1
# Prerequisites: Backend running on port 5000
# ============================================

param(
    [string]$BaseUrl = "http://localhost:5000/api/v1"
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "e2e_${timestamp}@test.com"
$testPassword = "E2eTest123!"
$userResults = @()
$adminResults = @()

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  E2E TEST SUITE - SaaS Platform" -ForegroundColor Cyan
Write-Host "  API: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============ USER FLOWS (15 steps) ============
Write-Host "--- USER FLOWS ---`n" -ForegroundColor Magenta

# 1: Register
Write-Host "  1. Register new user" -ForegroundColor Yellow -NoNewline
try {
    $reg = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST -ContentType "application/json" -Body (@{email=$testEmail; password=$testPassword; name="E2E Test User"} | ConvertTo-Json)
    $token = $reg.data.token; $userId = $reg.data.user.id
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red; $userResults += "FAIL" }

# 2: Login
Write-Host "  2. Login" -ForegroundColor Yellow -NoNewline
try {
    $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email=$testEmail; password=$testPassword} | ConvertTo-Json)
    $token = $login.data.token
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

$headers = @{ Authorization = "Bearer $token" }

# 3: Auth/me
Write-Host "  3. Get current user (auth/me)" -ForegroundColor Yellow -NoNewline
try {
    $me = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Headers $headers
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 4: Get plans
Write-Host "  4. Get all plans" -ForegroundColor Yellow -NoNewline
try {
    $plans = (Invoke-RestMethod -Uri "$BaseUrl/plans" -Headers $headers).data.plans
    $planId = ($plans | Where-Object { $_.name -eq "Individual" }).id
    Write-Host " PASS ($($plans.Count) plans)" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 5: Subscribe
Write-Host "  5. Subscribe to Individual plan" -ForegroundColor Yellow -NoNewline
try {
    $sub = Invoke-RestMethod -Uri "$BaseUrl/subscriptions" -Method POST -ContentType "application/json" -Headers $headers -Body (@{planId=$planId} | ConvertTo-Json)
    $subId = $sub.data.subscription.id
    Write-Host " PASS (status: $($sub.data.subscription.status))" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 6: My subscriptions
Write-Host "  6. Get my subscriptions" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/subscriptions/my" -Headers $headers | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 7: Create payment
Write-Host "  7. Create payment" -ForegroundColor Yellow -NoNewline
try {
    $pay = Invoke-RestMethod -Uri "$BaseUrl/payments" -Method POST -ContentType "application/json" -Headers $headers -Body (@{subscriptionId=$subId; amount=9.99; provider="STRIPE"} | ConvertTo-Json)
    $payId = $pay.data.payment.id; if (-not $payId) { $payId = $pay.data.id }
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 8: Simulate payment
Write-Host "  8. Simulate payment processing" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/payments/$payId/simulate" -Method POST -ContentType "application/json" -Headers $headers -Body (@{action="complete"} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 9: Webhook
Write-Host "  9. Payment webhook callback" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/payments/$payId/webhook" -Method POST -ContentType "application/json" -Body (@{status="COMPLETED"; transactionId="txn_$timestamp"} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 10: Verify subscription active
Write-Host " 10. Verify subscription is ACTIVE" -ForegroundColor Yellow -NoNewline
try {
    $vs = Invoke-RestMethod -Uri "$BaseUrl/subscriptions/$subId" -Headers $headers
    $st = $vs.data.subscription.status; if (-not $st) { $st = $vs.data.status }
    if ($st -eq "ACTIVE") { Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS" }
    else { Write-Host " FAIL (got: $st)" -ForegroundColor Red; $userResults += "FAIL" }
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 11: My payments
Write-Host " 11. Get my payments" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/payments/my" -Headers $headers | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 12: Update profile
Write-Host " 12. Update profile" -ForegroundColor Yellow -NoNewline
$newEmail = "e2e_upd_${timestamp}@test.com"
try {
    Invoke-RestMethod -Uri "$BaseUrl/users/profile" -Method PUT -ContentType "application/json" -Headers $headers -Body (@{email=$newEmail} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 13: Change password
Write-Host " 13. Change password" -ForegroundColor Yellow -NoNewline
$newPwd = "E2eNew123!"
try {
    Invoke-RestMethod -Uri "$BaseUrl/users/password" -Method PUT -ContentType "application/json" -Headers $headers -Body (@{currentPassword=$testPassword; newPassword=$newPwd} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 14: Re-login with new credentials
Write-Host " 14. Re-login with new credentials" -ForegroundColor Yellow -NoNewline
try {
    $rl = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email=$newEmail; password=$newPwd} | ConvertTo-Json)
    $token = $rl.data.token; $headers = @{ Authorization = "Bearer $token" }
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# 15: Cancel subscription
Write-Host " 15. Cancel subscription" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/subscriptions/$subId/cancel" -Method POST -Headers $headers | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $userResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $userResults += "FAIL" }

# ============ ADMIN FLOWS (15 steps) ============
Write-Host "`n--- ADMIN FLOWS ---`n" -ForegroundColor Magenta

# A1: Admin login
Write-Host "  1. Admin login" -ForegroundColor Yellow -NoNewline
try {
    $adm = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email="admin@subscription.com"; password="Admin123!"} | ConvertTo-Json)
    $at = $adm.data.token; $ah = @{ Authorization = "Bearer $at" }
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A2: Get all users
Write-Host "  2. Get all users" -ForegroundColor Yellow -NoNewline
try {
    $users = Invoke-RestMethod -Uri "$BaseUrl/users" -Headers $ah
    $targetUser = $users.data.users | Where-Object { $_.email -match "e2e_upd" } | Select-Object -First 1
    $targetUserId = $targetUser.id
    Write-Host " PASS ($($users.data.users.Count) users)" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A3: User stats
Write-Host "  3. Get user statistics" -ForegroundColor Yellow -NoNewline
try {
    $us = Invoke-RestMethod -Uri "$BaseUrl/users/stats/overview" -Headers $ah
    Write-Host " PASS (total: $($us.data.totalUsers))" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A4: Get user by ID
Write-Host "  4. Get user by ID" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/users/$targetUserId" -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A5: Update role
Write-Host "  5. Update user role to ADMIN" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/users/$targetUserId/role" -Method PUT -ContentType "application/json" -Headers $ah -Body (@{role="ADMIN"} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A6: Get all plans
Write-Host "  6. Get all plans (admin)" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/plans" -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A7: Create plan
Write-Host "  7. Create new plan" -ForegroundColor Yellow -NoNewline
try {
    $np = Invoke-RestMethod -Uri "$BaseUrl/plans" -Method POST -ContentType "application/json" -Headers $ah -Body (@{name="E2E Test Plan"; price=19.99; durationDays=90} | ConvertTo-Json)
    $newPlanId = $np.data.plan.id; if (-not $newPlanId) { $newPlanId = $np.data.id }
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A8: Update plan
Write-Host "  8. Update plan" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/plans/$newPlanId" -Method PUT -ContentType "application/json" -Headers $ah -Body (@{name="E2E Updated Plan"; price=24.99} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A9: Delete plan
Write-Host "  9. Delete plan" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/plans/$newPlanId" -Method DELETE -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A10: All subscriptions
Write-Host " 10. Get all subscriptions" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/subscriptions" -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A11: Subscription stats
Write-Host " 11. Get subscription statistics" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/subscriptions/stats/overview" -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A12: All payments
Write-Host " 12. Get all payments" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/payments" -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A13: Payment stats
Write-Host " 13. Get payment statistics" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/payments/stats/overview" -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A14: Revert role back to USER
Write-Host " 14. Revert user role to USER" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/users/$targetUserId/role" -Method PUT -ContentType "application/json" -Headers $ah -Body (@{role="USER"} | ConvertTo-Json) | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# A15: Delete user
Write-Host " 15. Delete test user" -ForegroundColor Yellow -NoNewline
try {
    Invoke-RestMethod -Uri "$BaseUrl/users/$targetUserId" -Method DELETE -Headers $ah | Out-Null
    Write-Host " PASS" -ForegroundColor Green; $adminResults += "PASS"
} catch { Write-Host " FAIL" -ForegroundColor Red; $adminResults += "FAIL" }

# ============ SUMMARY ============
$userPass = ($userResults | Where-Object { $_ -eq "PASS" }).Count
$userFail = ($userResults | Where-Object { $_ -eq "FAIL" }).Count
$adminPass = ($adminResults | Where-Object { $_ -eq "PASS" }).Count
$adminFail = ($adminResults | Where-Object { $_ -eq "FAIL" }).Count
$totalPass = $userPass + $adminPass
$totalFail = $userFail + $adminFail

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  User Flows:  $userPass/15 PASS, $userFail/15 FAIL" -ForegroundColor $(if ($userFail -eq 0) { "Green" } else { "Red" })
Write-Host "  Admin Flows: $adminPass/15 PASS, $adminFail/15 FAIL" -ForegroundColor $(if ($adminFail -eq 0) { "Green" } else { "Red" })
Write-Host "  Total:       $totalPass/30 PASS, $totalFail/30 FAIL" -ForegroundColor $(if ($totalFail -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================`n" -ForegroundColor Cyan
