# AUTOBID.TJ - Auto Auction Platform

## Overview

AUTOBID.TJ is a comprehensive auto auction platform built with modern web technologies, featuring real-time bidding, user management, and administrative tools. The application provides a complete auction ecosystem for buying and selling vehicles with integrated SMS verification, payment processing, and administrative oversight.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for global state, TanStack Query for server state
- **Mobile-First Design**: Responsive design with bottom navigation for mobile users

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Image Processing**: Sharp.js for automatic image compression and optimization
- **Real-time Features**: WebSocket-like polling for auction updates

### Database Design
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Tables**: Users, car listings, bids, favorites, notifications, alerts, banners
- **Indexing**: Optimized indexes for auction status and user queries
- **Data Integrity**: Foreign key constraints and validation schemas

## Key Components

### User Management System
- **Authentication**: Username/email login with planned SMS verification
- **Authorization**: Role-based access (buyer, seller, admin)
- **User Activation**: Admin-controlled user activation system
- **Profile Management**: Full name, profile photos, and contact information

### Auction System
- **Listing Management**: Car specifications, photos, auction duration
- **Real-time Bidding**: Live bid updates with price animations
- **Timer System**: Countdown timers with server synchronization
- **Status Tracking**: Pending, active, ended, rejected auction states
- **Image Optimization**: Automatic compression from 1.2MB to 150-180KB

### Administrative Dashboard
- **Retool Integration**: Complete admin panel for user and auction management
- **User Activation**: Bulk user status management
- **Content Moderation**: Auction approval and rejection workflow
- **Analytics**: System statistics and performance monitoring

### Performance Optimizations
- **API Optimization**: Reduced payload from 9MB to 6.3KB for listing endpoints
- **Image System**: Separate photo endpoints with server-side caching
- **Caching Strategy**: Multi-level caching (memory, HTTP headers, browser)
- **Database Optimization**: Selective queries and indexed searches

## Data Flow

### Auction Lifecycle
1. **Seller Submission**: User creates listing with photos and specifications
2. **Admin Review**: Pending listings require administrative approval
3. **Auction Start**: Approved listings become active with countdown timers
4. **Bidding Process**: Real-time bid updates with price validation
5. **Auction End**: Automatic status change and winner notification
6. **Post-Auction**: Sales tracking and user notifications

### User Interaction Flow
1. **Registration**: User creates account (inactive by default)
2. **Activation**: Admin activates user account for bidding
3. **Browsing**: Users can view all auctions regardless of activation status
4. **Bidding**: Only activated users can place bids
5. **Notifications**: Real-time updates for bid status and auction results

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives with shadcn/ui
- **Image Processing**: Sharp.js for server-side image optimization
- **Validation**: Zod for runtime type validation
- **Styling**: Tailwind CSS with custom design system

### Development Tools
- **Build System**: Vite with TypeScript support
- **Code Quality**: ESLint and TypeScript strict mode
- **Package Manager**: npm with lockfile for consistent installs

### External Integrations
- **SMS Service**: Prepared infrastructure for SMS verification (implementation pending)
- **WhatsApp Integration**: Direct contact links for customer support
- **Admin Panel**: Retool dashboard for administrative operations

## Deployment Strategy

### Replit Deployment
- **Environment**: Replit Deployments with autoscale configuration
- **Build Process**: Automated frontend and backend bundling
- **Port Configuration**: Multiple ports for development and production
- **Health Checks**: Endpoint monitoring for deployment status

### Production Optimizations
- **Static Assets**: Optimized builds with asset hashing
- **Server Configuration**: Express.js with production middleware
- **Environment Variables**: Secure configuration management
- **Process Management**: Graceful shutdown and error handling

### Performance Monitoring
- **Load Times**: API response optimization from 3+ seconds to 400-1100ms
- **Image Delivery**: 85% reduction in image file sizes
- **Caching**: Strategic caching at multiple levels
- **Database Performance**: Optimized queries and selective data loading

## Changelog
- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.