# Environment Setup

## Required Environment Variables

This application requires certain environment variables to be configured for full functionality.

### Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure the required variables in `.env.local`:**

### Google Maps API Configuration

The application uses Google Maps for displaying event locations. To enable this functionality:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a new project or select an existing one
   - Enable the **Maps Embed API**
   - Create credentials (API Key)
   - Optionally restrict the API key to your domains for security

2. **Add the API key to `.env.local`:**
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### Supabase Configuration

The application uses Supabase for data storage:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Best Practices

- **Never commit `.env.local`** to version control (it's already in `.gitignore`)
- **Use API key restrictions** in Google Cloud Console to limit usage to your domains
- **Rotate API keys periodically** for enhanced security
- **Use different API keys** for development and production environments

## Development

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## Production Deployment

Ensure all environment variables are properly configured in your production environment before deployment.