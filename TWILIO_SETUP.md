# Twilio Setup Guide

## Current Status

The Twilio integration is fully implemented but requires valid credentials to function.

### Credential Configuration

Your Twilio credentials should be added to `.env.local`:
- Account SID: `YOUR_TWILIO_ACCOUNT_SID`
- Phone Number: `YOUR_TWILIO_PHONE_NUMBER`
- Auth Token: [Stored securely in .env.local]

### Testing Credentials

To verify your Twilio credentials are working:

```bash
# Run the authentication test
node scripts/test-twilio-auth.js

# If authentication works, test SMS sending
node scripts/test-sms-production.js
```

### Troubleshooting Authentication Issues

If you're getting authentication errors:

1. **Verify Credentials in Twilio Console**
   - Log into [Twilio Console](https://console.twilio.com)
   - Check Account SID matches your actual Account SID
   - Navigate to Account → API Keys & Tokens
   - Verify the Auth Token is correct

2. **Common Issues**
   - Auth Token may have been regenerated
   - Account might be suspended or inactive
   - Credentials might have typos or extra spaces
   - Account might not have SMS capabilities enabled

3. **To Get New Auth Token**
   - Log into Twilio Console
   - Go to Account → API Keys & Tokens
   - Click "View" next to Auth Token
   - Copy the token and update in `.env.local`

### Quick Test

Once credentials are verified, you can test SMS sending:

```bash
# This will prompt you for a phone number and send a test SMS
node scripts/test-sms-production.js
```

### Next Steps

1. **Fix Authentication**
   - Verify the Auth Token in Twilio Console
   - Update `.env.local` if needed
   - Run `node scripts/test-twilio-auth.js` to confirm

2. **Test SMS Functionality**
   - Use the test script to send a real SMS
   - Verify webhooks are working
   - Check delivery status in Twilio Console

3. **Deploy to Production**
   - Add credentials to your hosting platform
   - Never commit `.env.local` to git
   - Follow the deployment guide in DEPLOYMENT.md

### Security Reminder

- **NEVER** commit `.env.local` to version control
- **NEVER** share your Auth Token
- **ALWAYS** use environment variables for credentials
- **ROTATE** credentials if compromised

### Support

If credentials are correct but still not working:
1. Check Twilio account status
2. Verify account has sufficient balance
3. Ensure phone number is active
4. Contact Twilio support if needed