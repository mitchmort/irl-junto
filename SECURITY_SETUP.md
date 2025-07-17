# 🔐 Junto Security Setup Guide

## Critical Security Notice

This document outlines secure practices for handling Twilio credentials and webhook security in the Junto application.

## ⚠️ IMMEDIATE ACTION REQUIRED

**The following types of credentials were exposed and must be rotated immediately:**

1. **Twilio Account SID**: `AC****************************` (32-character identifier)
2. **Twilio Auth Token**: `c****************************` (32-character secret)
3. **Google Maps API Key**: `AIza****************************` (API key starting with AIza)

## 🚀 Immediate Steps to Secure Your Application

### 1. Rotate Twilio Credentials

1. **Log into Twilio Console**: https://console.twilio.com
2. **Navigate to Account > API Keys & Tokens**
3. **Reset Auth Token**:
   - Click "View" next to your Auth Token
   - Click "Reset Token"
   - Copy the new token immediately
4. **Update Production Environment Variables**

### 2. Rotate Google Maps API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Navigate to APIs & Services > Credentials**
3. **Find the exposed key and restrict/regenerate it**
4. **Create a new key with proper restrictions**

### 3. Update Supabase Keys (if needed)

1. **Check Supabase Dashboard**: https://app.supabase.com
2. **Navigate to Settings > API**
3. **Consider regenerating service role key if exposed**

## 🛡️ Secure Environment Configuration

### Development Environment (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Maps API Configuration - DEVELOPMENT ONLY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_development_google_maps_api_key

# Twilio Configuration - DEVELOPMENT/TEST CREDENTIALS ONLY
# Use Twilio test credentials from: https://www.twilio.com/docs/iam/test-credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_development_twilio_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Cron Configuration - DEVELOPMENT ONLY
CRON_SECRET=development_cron_secret_safe_to_commit
```

### Production Environment

**DO NOT PUT PRODUCTION CREDENTIALS IN .env.local**

Instead, set them in your deployment platform:

#### Vercel:
```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
```

#### Other Platforms:
Set environment variables through your platform's dashboard or CLI.

## 🔒 Webhook Security

### What We Fixed

1. **Added signature validation** to both incoming SMS and status webhooks
2. **Production mode now requires valid signatures**
3. **Development mode logs when validation is skipped**

### Webhook URLs for Twilio Console

Configure these in your Twilio Console:

- **Status Callback URL**: `https://your-domain.com/api/twilio/webhook/status`
- **Incoming SMS URL**: `https://your-domain.com/api/twilio/webhook/incoming`

## 🚫 Security Rules

### Never Commit These Files:
- `.env.local`
- `.env.production.local`
- Any file containing real credentials

### Always Use:
- Test credentials for development
- Environment variable injection for production
- Webhook signature validation
- Rate limiting (implement in production)

## 🔍 Security Checklist

- [ ] Rotated exposed Twilio credentials
- [ ] Rotated exposed Google Maps API key
- [ ] Updated production environment variables
- [ ] Verified webhook signature validation is working
- [ ] Removed all real credentials from local files
- [ ] Set up proper environment separation
- [ ] Configured webhook URLs in Twilio Console
- [ ] Tested webhook security in production

## 📞 Emergency Response

If credentials are exposed:

1. **Immediately rotate all exposed credentials**
2. **Check usage logs for unauthorized access**
3. **Update all deployment environments**
4. **Monitor for unusual activity**
5. **Review git history for other exposures**

## 🔄 Testing Webhook Security

```bash
# Test development webhook (should work without signature)
curl -X POST http://localhost:3000/api/twilio/webhook/status \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test123&MessageStatus=delivered"

# Test production webhook (should require signature)
curl -X POST https://your-domain.com/api/twilio/webhook/status \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test123&MessageStatus=delivered"
# Should return 401 Unauthorized
```

## 📚 Additional Resources

- [Twilio Webhook Security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
- [Twilio Test Credentials](https://www.twilio.com/docs/iam/test-credentials)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember**: Security is not optional. Always validate webhooks, rotate exposed credentials immediately, and never commit secrets to version control. 