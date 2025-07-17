# 🔄 Twilio Credential Rotation Guide

## Overview

You have two sets of Twilio credentials that were exposed:
- **Test Credentials**: `AC4f09eaf...` (from .claude/settings.local.json)
- **Production Credentials**: `AC6081bf...` (from documentation)

This guide will walk you through safely rotating both sets.

## 📋 Pre-Rotation Checklist

- [ ] Identify which Twilio Console/Project each credential set belongs to
- [ ] Note current webhook URLs configured in both accounts
- [ ] Backup current `.env.local` and production environment variables
- [ ] Ensure you have admin access to both Twilio accounts

## 🔧 Step 1: Rotate Test/Development Credentials

### 1.1 Access Test Twilio Console
```bash
# Log into the Twilio account containing: AC4f09eaf00171644386c6fe726cb2f081
# Navigate to: https://console.twilio.com/
```

### 1.2 Generate New API Key & Secret (Recommended Method)
```bash
# In Twilio Console:
# 1. Go to Account > API Keys & Tokens
# 2. Click "Create API Key"
# 3. Name: "Junto Development Key"
# 4. Copy the SID and Secret immediately (shown only once!)
```

### 1.3 Alternative: Reset Auth Token
```bash
# If you prefer Auth Token over API Key:
# 1. Go to Account > API Keys & Tokens  
# 2. Click "View" next to Auth Token
# 3. Click "Reset Token" 
# 4. Copy new token immediately
```

### 1.4 Update Development Environment
```bash
# Update your .env.local file:
TWILIO_ACCOUNT_SID=AC4f09eaf00171644386c6fe726cb2f081  # Same account SID
TWILIO_AUTH_TOKEN=your_new_auth_token                   # New token
# OR if using API Key:
TWILIO_API_KEY=SK_your_new_api_key_sid                 # New API Key SID  
TWILIO_API_SECRET=your_new_api_secret                  # New API Secret
TWILIO_PHONE_NUMBER=+14247226272                       # Same phone number
```

## 🏭 Step 2: Rotate Production Credentials

### 2.1 Access Production Twilio Console
```bash
# Log into the production Twilio account containing: AC6081bf3df3829110a94a6a51e5e4ae3d
# This might be a different Twilio account or project
```

### 2.2 Generate New Production Credentials
```bash
# Follow same process as Step 1.2 or 1.3
# Name: "Junto Production Key" 
```

### 2.3 Update Production Environment
```bash
# Update your production deployment environment variables:
# 
# For Vercel:
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN  
vercel env add TWILIO_PHONE_NUMBER

# For other platforms, update through their dashboard/CLI
```

## 🔗 Step 3: Update Webhook URLs

### 3.1 Configure Test Account Webhooks
```bash
# In test Twilio Console:
# 1. Go to Phone Numbers > Manage > Active Numbers
# 2. Click your test phone number
# 3. Update webhook URLs:
#    - SMS: https://your-staging-domain.com/api/twilio/webhook/incoming
#    - Status: https://your-staging-domain.com/api/twilio/webhook/status
```

### 3.2 Configure Production Account Webhooks  
```bash
# In production Twilio Console:
# 1. Go to Phone Numbers > Manage > Active Numbers
# 2. Click your production phone number  
# 3. Update webhook URLs:
#    - SMS: https://your-production-domain.com/api/twilio/webhook/incoming
#    - Status: https://your-production-domain.com/api/twilio/webhook/status
```

## 🧪 Step 4: Test New Credentials

### 4.1 Test Development Environment
```bash
# Run the test script with new credentials:
cd /Users/home/irl-junto
npm run test

# Test SMS sending manually:
node scripts/test-sms-production.js
```

### 4.2 Test Production Environment  
```bash
# Deploy with new credentials and test a webhook:
# Send a test SMS to your production number
# Check logs for successful webhook processing
```

## 🧹 Step 5: Clean Up Local Environment

### 5.1 Update .env.local 
```bash
# Replace with new development credentials
# Ensure no production credentials are in local files
```

### 5.2 Revoke Old Credentials
```bash
# In both Twilio Consoles:
# 1. Delete/revoke the old API keys
# 2. Ensure old auth tokens are invalidated
```

## ✅ Step 6: Verification Checklist

- [ ] New test credentials work for SMS sending
- [ ] New production credentials work for SMS sending  
- [ ] Incoming SMS webhook works with signature validation
- [ ] Status webhook works with signature validation
- [ ] Old credentials are revoked in Twilio Console
- [ ] Production environment variables updated
- [ ] Local `.env.local` contains only test credentials
- [ ] No production credentials in local files

## 🚀 Step 7: Deploy & Test End-to-End

### 7.1 Deploy Application
```bash
# After all credentials are rotated and updated:
git add .
git commit -m "feat: rotate Twilio credentials for enhanced security"
git push origin dev
```

### 7.2 End-to-End Testing
```bash
# Test complete SMS flow:
# 1. User registration with phone verification
# 2. Event creation with SMS notifications  
# 3. SMS reminder sending
# 4. Incoming SMS handling (STOP/START commands)
```

## 📞 Emergency Rollback Plan

If issues arise during rotation:

### Immediate Steps:
1. **Revert environment variables** to previous working credentials temporarily
2. **Check Twilio Console logs** for detailed error messages
3. **Verify webhook URLs** are correctly configured
4. **Test credentials** using scripts/test-twilio-auth.js

### Rollback Commands:
```bash
# Temporarily restore old credentials for debugging:
# (Keep old credentials until new ones are fully tested)

# Check Twilio connection:
node scripts/test-twilio-connection.js

# Verify webhook signatures:
curl -X POST https://your-domain.com/api/twilio/webhook/status \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test&MessageStatus=delivered"
```

## 🔐 Security Notes

1. **Never commit real credentials** to git
2. **Use different credentials for development vs production**
3. **Rotate credentials regularly** (every 90 days recommended)
4. **Monitor Twilio usage logs** for unauthorized access
5. **Use API Keys instead of Auth Tokens** when possible (more secure)

## 📊 Post-Rotation Security Benefits

After completing this rotation:
- ✅ All exposed credentials invalidated
- ✅ Clean git history (no active credentials)
- ✅ Proper environment separation  
- ✅ Enhanced webhook security
- ✅ Audit trail of credential changes

---

**Estimated Time**: 30-60 minutes
**Risk Level**: Low (with proper testing)
**Downtime**: None (if done correctly) 