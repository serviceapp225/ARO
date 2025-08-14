# AUTOBID.TJ - Car Auction Platform

## Overview

AUTOBID.TJ is a full-stack car auction platform designed for viewing, bidding on, and selling cars through an auction system. It aims to provide a mobile-first experience with comprehensive administrative controls and integrated SMS authentication. The platform is built to offer a robust and efficient car auction marketplace.

## User Preferences

Preferred communication style: Simple, everyday language in Russian.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI**: Shadcn/ui components, Tailwind CSS
- **State Management**: React Context API
- **Routing**: Wouter
- **Data Fetching**: TanStack Query
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Image Processing**: Sharp.js for compression and optimization
- **Session Management**: Express sessions

### Database
- **Primary Database**: PostgreSQL (via Neon serverless for production) - **ACTIVE** (restored January 2025)
- **Migration Target**: DigitalOcean Managed PostgreSQL (Amsterdam AMS3) - **READY** (January 2025)
- **Development Database**: SQLite
- **Schema Management**: Drizzle Kit for migrations
- **Key Tables**: users, car_listings, bids, favorites, notifications, car_alerts, banners

### Core Features
- **Authentication**: Role-based access (buyer/seller/admin), manual user activation, SMS verification infrastructure, Google OAuth integration (prepared). Profile photos stored in database with full persistence.
- **Auction Management**: Real-time countdowns, automatic bid validation, status management (pending, active, ended, rejected), image carousels.
- **User Features**: Favorites, car alerts, bidding history, profile management with photo uploads.
- **Admin Features**: User activation/deactivation, listing moderation, banner management, analytics dashboard.
- **Performance**: Aggressive image compression (1.2MB to 150-180KB), API response optimization (9MB to 6.3KB), multi-level caching (server, HTTP, browser), lazy loading.
- **Real-time Communication**: WebSocket manager for instant updates and notifications with automatic main page card refresh.
- **Messaging System**: Integrated messaging for buyer-seller communication, with unread message indicators.
- **Automatic Auction Restart**: Failed auctions (no bids or reserve price not met) automatically restart with original starting bid and extended 7-day duration.
- **Complete Notification System**: Automatic notifications for auction winners and losers when auctions end, both through scheduled processing and manual admin completion.
- **Integrated SMS Notifications**: Automatic SMS delivery for auction outcomes (win/loss) via VPS proxy server, seamlessly integrated with in-app notifications through OSON SMS API.
- **Real-time Price Updates**: Main page auction cards automatically refresh every 3 seconds and immediately update via WebSocket when new bids are placed, ensuring users always see current auction prices without manual page refresh.
- **Stable Authentication**: Fixed issue where users were logged out during page refresh or network errors by preventing localStorage clearing on API failures.
- **File-based Image Storage**: Migrated from base64 database storage to optimized filesystem storage with Sharp compression, reducing database size and improving performance for 10,000+ vehicle capacity.

### UI/UX Decisions
- Mobile-first design.
- Minimalist and clean design aesthetic with consistent typography and spacing.
- Centered page titles without decorative elements.
- Use of Shadcn/ui for accessible and visually appealing components.
- Image carousels with auto-play and manual navigation.
- Smooth transitions and animations for a fluid user experience.
- Confetti and sound effects for successful bids.

### Deployment Strategy
- **Target Platform**: DigitalOcean App Platform (READY FOR DEPLOYMENT - August 2025)
- **Migration Status**: 🎯 DEPLOYMENT READY - All build issues resolved
- **Infrastructure Choice**: App Platform + Managed PostgreSQL + Spaces storage for scalability
- **Cost**: ~$55-60/month (vs $24/month VPS) - reliability trade-off accepted
- **Components Ready**: 
  - ✅ Dockerfile (multi-stage, fixed build issues)
  - ✅ .do/app.yaml (corrected App Platform config format)
  - ✅ Health check endpoint (/health)
  - ✅ DigitalOcean Spaces integration (server/spacesService.ts)
  - ✅ Migration script (server/migrateToSpaces.ts)
  - ✅ Missing file references cleaned up (Act_*.mp3, rodan-can-*.jpg)
- **Build Fixes Applied (August 2025)**:
  - Removed references to missing audio/image files
  - Fixed Dockerfile client/dist copying issue
  - Corrected .do/app.yaml format (removed problematic build_command syntax)
  - Synchronized port configuration (8080)
- **Next Steps**: Create Managed Database → Create Spaces bucket → Deploy using .do/app.yaml

## External Dependencies

- **@neondatabase/serverless**: PostgreSQL database connection.
- **drizzle-orm**: Type-safe ORM for database interactions.
- **sharp**: Image processing library.
- **express**: Web server framework.
- **react**: Frontend UI library.
- **@tanstack/react-query**: Server state management in React.
- **@radix-ui/react-***: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **lucide-react**: Icon library.
- **class-variance-authority**: Component variant management.
- **wouter**: Client-side routing.
- **vite**: Frontend build tool.
- **typescript**: Language for type checking.
- **esbuild**: JavaScript bundler for backend.
- **OSON SMS API (via VPS proxy)**: For SMS authentication and notifications.
- **PostgreSQL**: Production database.
- **SQLite**: Development database.