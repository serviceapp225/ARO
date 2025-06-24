# AUTOBID.TJ - Car Auction Platform

## Overview

AUTOBID.TJ is a comprehensive car auction platform built for the Tajikistan market. The application allows users to browse, bid on, and sell vehicles through an online auction system. The platform features a modern web interface with mobile-responsive design, real-time bidding, user management, and comprehensive admin capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context API for global state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication with user activation system
- **File Handling**: Sharp.js for image optimization and processing
- **API Design**: RESTful API with comprehensive admin endpoints

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless database
- **ORM**: Drizzle ORM with schema-first approach
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **File Storage**: Base64 image storage with automatic compression
- **Caching**: In-memory caching for performance optimization

## Key Components

### Core Features
1. **User Management System**
   - Registration with phone number verification
   - User activation system (inactive by default)
   - Role-based access (admin, seller, buyer)
   - Profile management with photo upload

2. **Auction System**
   - Real-time countdown timers
   - Automated bid processing
   - Lot number generation (6-digit unique numbers)
   - Auction status management (pending, active, ended, rejected)

3. **Vehicle Listings**
   - Comprehensive car specifications (make, model, year, mileage, etc.)
   - Multiple photo uploads with automatic optimization
   - Technical documentation status tracking
   - Customs clearance and recycling status

4. **Bidding System**
   - Real-time bid updates
   - Bid history tracking
   - Winning bid notifications
   - User bid management

5. **Favorites & Alerts**
   - Save favorite listings
   - Create search alerts for specific criteria
   - Email notifications for matching vehicles

6. **Admin Dashboard**
   - User activation/deactivation
   - Listing moderation
   - Banner management
   - Statistics and analytics

### Performance Optimizations
- **Image Compression**: Automatic image optimization reducing file sizes by 85%
- **API Optimization**: Reduced API response sizes from 9MB to 6.3KB
- **Caching Strategy**: Multi-level caching (server, HTTP, browser)
- **Lazy Loading**: On-demand image loading for better performance

## Data Flow

### User Authentication Flow
1. User enters phone number on login page
2. Demo authentication creates inactive user account
3. User can browse and favorite items but cannot bid
4. Admin must activate user account for bidding privileges
5. Activated users gain full auction participation rights

### Auction Lifecycle
1. Seller creates listing (pending status)
2. Admin reviews and approves/rejects listing
3. Approved listings become active auctions
4. Users place bids during auction period
5. Auction automatically ends at specified time
6. Winning bidder and seller are notified

### Data Synchronization
- Real-time updates for auction timers
- Automatic refresh of bid information
- Context-based state management for user data
- Query invalidation for fresh data fetching

## External Dependencies

### Core Dependencies
- React ecosystem: React 18, React Router, React Query
- UI Components: Radix UI primitives, Lucide React icons
- Database: PostgreSQL, Drizzle ORM, Neon serverless
- Image Processing: Sharp.js for optimization
- Validation: Zod for schema validation
- Styling: Tailwind CSS, class-variance-authority

### Development Tools
- TypeScript for type safety
- Vite for development and building
- ESLint and Prettier for code quality
- Drizzle Kit for database migrations

### External Services
- Neon PostgreSQL for database hosting
- WhatsApp integration for customer support
- SMS service integration (prepared but not implemented)

## Deployment Strategy

### Production Build
- Vite builds optimized frontend bundle
- ESBuild compiles TypeScript server code
- Static assets served with appropriate caching headers
- Environment-specific configuration management

### Replit Deployment
- Configured for Replit's autoscale deployment target
- Multiple port configurations for development flexibility
- Automatic build and start scripts
- Database URL configuration via environment variables

### Performance Considerations
- Image optimization pipeline reduces bandwidth usage
- Efficient database queries with selective field loading
- Client-side caching strategies
- CDN-ready static asset organization

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.