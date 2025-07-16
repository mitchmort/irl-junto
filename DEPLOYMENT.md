# Deployment Guide for JUNTO

This guide covers deploying the JUNTO application with SMS notifications to various platforms.

## Prerequisites

Before deploying, ensure you have:
- [ ] All environment variables configured (see `.env.example`)
- [ ] Twilio account with verified phone number
- [ ] Supabase project set up
- [ ] Domain name (for production)

## Environment Variables Required

```bash
# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Twilio (Secret - Never expose these)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
CRON_SECRET=your_generated_secret

# Optional
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deployment Platforms

### Vercel (Recommended)

#### 1. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link to your Vercel account
```

#### 2. Configure Environment Variables

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_PHONE_NUMBER production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add CRON_SECRET production
```

#### 3. Configure Webhook URLs

In your Twilio Console:
1. Go to Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Configure webhooks:
   - **Status Callback URL**: `https://yourdomain.com/api/twilio/webhook/status`
   - **Incoming Message URL**: `https://yourdomain.com/api/twilio/webhook/incoming`

#### 4. Set up Cron Jobs

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-notifications",
    "schedule": "*/5 * * * *"
  }]
}
```

### Alternative Platforms

#### Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Site Settings → Environment Variables
5. Use Netlify Functions for API routes

#### Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NEXT_PUBLIC_SUPABASE_URL=...
heroku config:set TWILIO_ACCOUNT_SID=...
# ... add all required variables

# Deploy
git push heroku main

# Set up scheduler for cron jobs
heroku addons:create scheduler:standard
heroku addons:open scheduler
# Add job: `node scripts/process-notifications.js` every 10 minutes
```

#### AWS Amplify

1. Connect to GitHub repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```
3. Add environment variables in App Settings
4. Use EventBridge for scheduled tasks

#### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

## Post-Deployment Checklist

### Immediate Tasks
- [ ] Test phone verification flow
- [ ] Send test SMS to verify Twilio integration
- [ ] Check webhook endpoints are accessible
- [ ] Verify cron jobs are running
- [ ] Test rate limiting is working
- [ ] Check error logging is functional

### Security Verification
- [ ] Ensure HTTPS is enforced
- [ ] Verify environment variables are not exposed
- [ ] Check CORS settings are restrictive
- [ ] Test webhook signature validation
- [ ] Confirm rate limiting prevents abuse

### Monitoring Setup
- [ ] Configure Twilio alerts for errors
- [ ] Set up usage monitoring
- [ ] Enable error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

### SMS Configuration
- [ ] Verify Twilio phone number is active
- [ ] Test SMS delivery to various carriers
- [ ] Check international SMS if applicable
- [ ] Verify opt-out mechanisms work
- [ ] Test delivery status webhooks

## Troubleshooting

### Common Issues

#### SMS Not Sending
1. Check Twilio credentials are correct
2. Verify phone number is in E.164 format
3. Check Twilio account has sufficient balance
4. Verify phone number isn't blocked

#### Environment Variables Not Loading
1. Restart the application after adding variables
2. Check variable names match exactly
3. Ensure no quotes in platform environment settings
4. Verify build cache is cleared

#### Webhooks Not Working
1. Check webhook URLs are publicly accessible
2. Verify CRON_SECRET matches
3. Check for CORS issues
4. Look for signature validation errors

#### Database Connection Issues
1. Verify Supabase URL is correct
2. Check anon key is valid
3. Ensure database migrations ran
4. Check row-level security policies

## Production Best Practices

1. **Use Environment-Specific Credentials**
   - Never use development credentials in production
   - Create separate Twilio subaccounts for each environment

2. **Enable Monitoring**
   - Set up error tracking (Sentry, Rollbar)
   - Configure performance monitoring
   - Enable Twilio usage alerts

3. **Implement Backups**
   - Regular database backups
   - Store SMS logs for compliance
   - Keep deployment rollback strategy

4. **Scale Appropriately**
   - Monitor SMS queue performance
   - Adjust rate limits based on usage
   - Consider message queuing for high volume

5. **Maintain Compliance**
   - Implement opt-out handling
   - Store consent records
   - Follow TCPA guidelines
   - Respect quiet hours

## Support

For deployment issues:
- Check logs in your platform's dashboard
- Review Twilio debugger for SMS issues
- Consult platform-specific documentation
- Open an issue in the repository

---

**Important:** Always test in a staging environment before deploying to production. Keep production credentials secure and never commit them to version control.