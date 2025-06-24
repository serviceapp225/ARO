# Auto Auction App - Project Documentation

## Overview
Auto auction application with React frontend, Express backend, and PostgreSQL database. Features real-time bidding, user authentication, and administrative controls.

## Project Architecture
- **Frontend**: React with Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Replit with multiple entry points for reliability

## Recent Changes
- **2025-06-24**: Fixed repeated deployment failures by creating production.cjs and main.js entry points
- **2025-06-24**: Added safe database error handling to prevent crashes after rollback
- **2025-06-24**: Identified rollback issue - DATABASE_URL remains pointing to old database credentials

## Known Issues After Rollback
When Replit rollback is performed:
1. Code reverts to previous checkpoint
2. Database state may revert to old snapshot
3. DATABASE_URL environment variable retains old credentials
4. Application starts but database functions fail with authentication errors

## Rollback Recovery Process
1. Application will start with safe error handling (no crash)
2. Database connection needs to be recreated
3. Schema needs to be pushed to new database
4. Sample data needs to be reinitialized

## User Preferences
- Language: Russian
- Prefers direct explanations without excessive technical details
- Values working solutions over detailed explanations

## Entry Points for Deployment
- `production.cjs` - Self-building CommonJS server (recommended)
- `main.js` - Universal entry point with fallback logic
- `npm start` - Standard production start command

## Database Schema
Located in `shared/schema.ts` with Drizzle ORM configuration.
Migration command: `npm run db:push`