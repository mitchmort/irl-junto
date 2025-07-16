# Security Guidelines for JUNTO

## 🔐 Credential Management

### Environment Variables

This project uses environment variables to manage sensitive credentials. **NEVER** commit credentials to version control.

#### Local Development
- Copy `.env.example` to `.env.local`
- Fill in your actual credentials in `.env.local`
- `.env.local` is gitignored and will never be committed

#### Production Deployment
- Use your platform's secure environment variable management
- Never store credentials in code or configuration files
- Rotate credentials regularly (recommended: every 90 days)

### Twilio Credentials

**Critical Security Requirements:**

1. **Account SID** (`TWILIO_ACCOUNT_SID`)
   - Format: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 34 characters starting with "AC"
   - This identifies your Twilio account

2. **Auth Token** (`TWILIO_AUTH_TOKEN`)
   - 32 character string
   - **EXTREMELY SENSITIVE** - provides full account access
   - Never share, log, or expose this token
   - If compromised, regenerate immediately in Twilio Console

3. **Phone Number** (`TWILIO_PHONE_NUMBER`)
   - Format: `+1XXXXXXXXXX` (E.164 format)
   - Must be a number you've purchased from Twilio

### Best Practices

#### DO ✅
- Store credentials only in environment variables
- Use `.env.local` for local development
- Configure production credentials in your hosting platform's dashboard
- Use webhook signature validation for incoming requests
- Implement rate limiting on SMS sending
- Monitor Twilio usage for anomalies
- Set up alerts for unusual activity
- Use separate Twilio subaccounts for dev/staging/production

#### DON'T ❌
- Hardcode credentials in source code
- Commit `.env` files to git
- Log credentials or include them in error messages
- Share credentials via email or chat
- Use the same credentials across environments
- Store credentials in client-side code
- Include credentials in API responses

### Security Checklist

Before deploying to production:

- [ ] All credentials are in environment variables
- [ ] No `.env` files are committed to git
- [ ] Production credentials are different from development
- [ ] Webhook endpoints validate signatures
- [ ] Rate limiting is configured and tested
- [ ] Error messages don't expose sensitive data
- [ ] Logging doesn't include credentials
- [ ] HTTPS is enforced for all endpoints
- [ ] CORS is properly configured
- [ ] Input validation is implemented

### Credential Rotation

#### When to Rotate
- Every 90 days (scheduled)
- When an employee with access leaves
- If any suspicious activity is detected
- After any potential security incident

#### How to Rotate Twilio Credentials
1. Log into [Twilio Console](https://console.twilio.com)
2. Navigate to Account → API Keys & Tokens
3. Generate new Auth Token
4. Update in all environments:
   - Local: `.env.local`
   - Production: Platform environment variables
5. Test SMS sending in all environments
6. Once confirmed working, delete old token

### Incident Response

If credentials are compromised:

1. **Immediately** rotate the compromised credentials
2. Review Twilio logs for unauthorized usage
3. Check for any unexpected charges
4. Update credentials in all environments
5. Investigate how the compromise occurred
6. Document the incident and prevention measures

### Platform-Specific Security

#### Vercel
```bash
# Add environment variables via CLI
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_PHONE_NUMBER production
```

#### Heroku
```bash
# Add environment variables via CLI
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set TWILIO_PHONE_NUMBER=your_number
```

#### AWS
- Use AWS Secrets Manager or Parameter Store
- Apply least-privilege IAM policies
- Enable encryption at rest

### Monitoring & Alerts

Set up monitoring for:
- Unusual SMS volume spikes
- Failed authentication attempts
- Error rates above normal thresholds
- Geographic anomalies in SMS destinations
- Repeated failed SMS deliveries

### Compliance

Ensure compliance with:
- TCPA (Telephone Consumer Protection Act) for SMS
- GDPR for EU users
- CCPA for California residents
- Industry-specific regulations (HIPAA, PCI-DSS, etc.)

### Contact

For security concerns or incidents:
- Security Team: security@yourcompany.com
- Emergency: [Your emergency contact]

---

**Remember:** Security is everyone's responsibility. When in doubt, ask for help rather than taking risks with credentials or sensitive data.