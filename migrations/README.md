# Database Migrations

This directory contains SQL migration files for the Junto database.

## Migration: Add URL Slugs to Events

### File: `001_add_url_slug_to_events.sql`

This migration replaces sequential numeric IDs with random URL slugs for event sharing.

### What it does:
1. Adds a `url_slug` column to the `events` table
2. Creates a unique index on the `url_slug` column
3. Creates PostgreSQL functions to generate random slugs
4. Populates existing events with unique slugs
5. Sets up triggers for automatic slug generation on new events

### How to apply:

#### Using Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `001_add_url_slug_to_events.sql`
4. Run the migration

#### Using Supabase CLI (if available):
```bash
supabase db push
```

### After migration:
1. Run the slug generation script for existing events:
   ```bash
   node scripts/generate-existing-event-slugs.js
   ```

2. Test the new URLs:
   - Old format: `/event/123` (still works for backward compatibility)
   - New format: `/event/k3x9-m7qp-8wfj`

### Changes made to codebase:
- Updated database types to include `url_slug` field
- Modified event creation flow to generate slugs
- Updated routes from `[id]` to `[slug]`
- Added slug-based event fetching hooks
- Updated share link generation to use slugs

### Rollback:
If you need to rollback, you can:
1. Remove the `url_slug` column: `ALTER TABLE events DROP COLUMN url_slug;`
2. Drop the functions: `DROP FUNCTION IF EXISTS generate_random_slug, generate_unique_event_slug, trigger_generate_event_slug;`
3. Revert the code changes to use numeric IDs

### Security Benefits:
- Prevents event enumeration attacks
- Makes URLs non-guessable
- Maintains backward compatibility during transition

## Migration: Add Profile Fields

### File: `002_add_profile_fields.sql`

This migration adds comprehensive profile fields to support the enhanced user profile system.

### What it does:
1. Adds a `bio` column for user descriptions/bios
2. Adds a `sports` column (TEXT[]) for storing user's sport preferences
3. Adds a `social_links` column (JSONB) for storing social media links

### How to apply:

#### Using Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `002_add_profile_fields.sql`
4. Run the migration

### After migration:
- Users can fill out comprehensive profiles in `/dashboard/pages/settings/profile`
- Public profiles at `/dashboard/pages/profile` will display the saved information
- Profile data is automatically synced between settings and public views

### Features enabled:
- Rich user bios displayed in About Me section
- Sports preferences shown as badges
- Social links with automatic domain detection
- Profile completeness tracking