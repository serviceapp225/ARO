# AUTOBID.TJ - Car Auction Platform

## Overview

AUTOBID.TJ is a full-stack car auction platform built with React, Express.js, and PostgreSQL. The platform allows users to view, bid on, and sell cars through an auction system. It features a mobile-first design with comprehensive admin functionality and SMS authentication capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Tailwind CSS
- **State Management**: React Context API for global state
- **Routing**: Wouter for client-side routing
- **Data Fetching**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Image Processing**: Sharp.js for automatic image compression and optimization
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle Kit for migrations
- **Key Tables**: users, car_listings, bids, favorites, notifications, car_alerts, banners

## Key Components

### Authentication System
- User registration with role-based access (buyer/seller/admin)
- Manual user activation system (admin-controlled)
- SMS verification infrastructure (ready for SMS provider integration)
- Google OAuth integration (prepared but not active)

### Auction Management
- Real-time countdown timers for auction listings
- Automatic bid validation and processing
- Status management (pending, active, ended, rejected)
- Image carousel with auto-play and manual navigation

### User Features
- Favorites system with persistent storage
- Car alerts for specific make/model combinations
- Bidding history with status tracking (active/won/lost)
- Profile management with photo uploads

### Admin Features
- User activation/deactivation controls
- Listing moderation and status management
- Banner management system (currently disabled)
- Analytics and user management dashboard

### Performance Optimizations
- Image compression: 1.2MB → 150-180KB (85% reduction)
- API optimization: 9MB → 6.3KB response size
- Multi-level caching: server, HTTP headers, browser
- Lazy loading and optimized asset delivery

## Data Flow

### Client-Server Communication
1. React components use TanStack Query for data fetching
2. Express.js routes handle API requests with validation
3. Drizzle ORM manages database operations
4. Real-time updates through periodic polling

### Image Handling
1. Frontend uploads images as base64
2. Backend processes with Sharp.js compression
3. Optimized images stored and served via dedicated endpoints
4. Automatic fallback to placeholder for missing images

### State Management
1. Auth context manages user authentication state
2. Auction context handles active listings and selected auctions
3. Favorites context manages user's saved items
4. UserData context handles profile information

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **sharp**: Image processing and compression
- **express**: Web server framework
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management

### UI/UX Dependencies
- **@radix-ui/react-***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **esbuild**: JavaScript bundling

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` via Vite
2. Backend bundles to `dist/index.js` via esbuild
3. Static assets served from built frontend
4. Production server handles both API and static content

### Environment Configuration
- **Development**: TSX for TypeScript execution
- **Production**: Compiled JavaScript with optimizations
- **Database**: Neon PostgreSQL with connection pooling

### Replit Compatibility
- Custom build scripts for Replit deployment
- Simplified production entry points
- Environment variable handling for database connections
- Health check endpoints for monitoring

## Changelog
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.