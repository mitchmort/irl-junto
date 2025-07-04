# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 dashboard template being adapted for "Junto" - a sports event coordination platform. The codebase uses modern React patterns with the App Router and is built on shadcn/ui components.

## Essential Commands

```bash
# Development
npm install                 # Install dependencies
npm run dev                # Start development server (http://localhost:3000)
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Alternative installation if peer dependency issues
npm install --legacy-peer-deps
```

## Architecture & Structure

- **Framework**: Next.js 15 with React 19 and TypeScript
- **UI Library**: shadcn/ui components (Radix UI based)
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **State Management**: Zustand for client state
- **Routing**: App Router with route groups for auth/guest flows

### Key Directories

- `/app/dashboard/(auth)` - Main authenticated application area
- `/app/dashboard/(guest)` - Public routes (login, register, etc.)
- `/components/ui` - shadcn/ui base components
- `/components/layout` - Header, Sidebar, Logo components
- `/lib` - Utilities and configuration
- `/store` - Zustand state stores
- `/hooks` - Custom React hooks

### Route Structure

- Root `/` and `/dashboard` redirect to `/dashboard/default`
- Two main dashboards: `/dashboard/default` (analytics) and `/dashboard/ecommerce`
- Built-in apps: AI Chat, Calendar, Chat with real-time features
- Settings pages for account, appearance, notifications
- Authentication flow with login/register/forgot-password

## Important Technical Details

- Uses Next.js middleware for root redirects
- Server-side theme persistence with cookies
- Path aliases configured: `@/*` maps to project root
- Image optimization configured for localhost and bundui-images.netlify.app
- Production asset prefix: `https://dashboard.shadcnuikit.com`

## Theme System

The app includes a comprehensive theme customizer with:
- Light/dark/system theme modes
- Customizable color presets
- Adjustable UI scale and border radius
- Content layout options (sidebar, header)
- Persistent preferences via cookies

## Testing & Quality

- ESLint configured with Next.js recommended config
- Prettier 3.6.0 with Tailwind plugin
- No test framework currently configured
- TypeScript strict mode enabled

## Business Context

This codebase is being adapted for Junto, a sports event coordination platform designed to "Create games in 30 seconds, share one link, and show up to play". The existing dashboard, calendar, and chat functionality provide a solid foundation for the sports coordination features.