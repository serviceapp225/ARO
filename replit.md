# AutoAuction Platform

## Overview

AutoAuction Platform is a comprehensive car auction management system built with React and Node.js. The application serves as an online marketplace where users can participate in car auctions, list vehicles for sale, and manage their automotive transactions. The platform supports both web and mobile interfaces with a focus on the Tajik market.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context API for global state, TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Mobile Support**: Responsive design with touch-optimized interactions

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based authentication with express-session
- **File Storage**: In-memory caching with Sharp.js for image optimization
- **API Design**: RESTful endpoints with comprehensive validation

## Key Components

### Authentication System
- Session-based authentication with secure cookie management
- User activation system (inactive users can browse but cannot bid)
- Role-based access control (admin, seller, buyer)
- SMS verification infrastructure ready for integration

### Auction Management
- Real-time auction timers with WebSocket support
- Bid management with validation and history tracking
- Auction status lifecycle (pending, active, ended, rejected)
- Automated auction ending and notification system

### User Management
- Profile management with photo uploads
- Favorites system for tracking preferred listings
- Personal dashboard for bids, sales, and notifications
- User data export functionality

### Image Handling
- Optimized image processing with Sharp.js
- Automatic compression (files >150KB compressed, >1MB/2MB with different quality levels)
- Base64 and URL-based image serving
- Performance optimization reducing API payload from 9MB to 6.3KB

### Admin Panel Integration
- Retool-compatible admin API endpoints
- User activation/deactivation controls
- Content moderation for listings
- Statistics and analytics endpoints

## Data Flow

### User Registration & Authentication
1. User creates account with email/username
2. Account created as inactive by default
3. Admin activates account through admin panel
4. Active users can participate in auctions

### Auction Lifecycle
1. Seller creates car listing with photos and details
2. Listing goes to "pending" status for admin review
3. Admin approves listing, sets to "active" status
4. Auction runs for specified duration with real-time bidding
5. Auction ends automatically, highest bidder wins
6. Notifications sent to relevant users

### Bidding Process
1. User views active auction details
2. Places bid higher than current bid
3. System validates bid and user activation status
4. Bid recorded, current price updated
5. Other bidders notified of new bid
6. Auction winner determined at end time

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web framework
- **sharp**: Image processing and optimization
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler for production

## Deployment Strategy

### Production Build Process
1. Frontend built with Vite to `dist/public/`
2. Backend compiled with esbuild to `dist/index.js`
3. Static assets served from Express
4. Single-process deployment suitable for Replit

### Environment Configuration
- **Development**: Full-stack development with HMR
- **Production**: Optimized build with static serving
- **Database**: Serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed session store

### Performance Optimizations
- Image compression reducing size by 85%
- API response caching with 30-second TTL
- Static asset caching with 1-hour TTL
- Selective database queries to minimize data transfer

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.