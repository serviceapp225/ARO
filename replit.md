# AutoBid.tj - Car Auction Platform

## Overview

AutoBid.tj is a comprehensive car auction platform for Tajikistan, built as a full-stack web application with mobile app capabilities. The platform enables users to participate in car auctions through SMS-based authentication, place bids, and manage listings with administrative oversight.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **Mobile**: Capacitor framework for iOS/Android app deployment
- **UI Components**: Radix UI components with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ESM modules
- **API**: RESTful API with JSON responses
- **Real-time**: WebSocket connections for live bidding
- **File Processing**: Sharp.js for image compression and optimization

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: TypeScript-first schema definitions
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Environment-based connection string

## Key Components

### Authentication System
- **SMS Integration**: OsonSMS API for phone verification
- **Flow**: Phone number → SMS code → User registration/login
- **Demo Mode**: Fallback system when SMS service unavailable
- **Session Management**: Server-side session handling

### Auction Management
- **Listing Creation**: Car details with photo upload and compression
- **Bidding System**: Real-time bid updates with validation
- **Status Management**: Pending → Active → Ended workflow
- **Admin Moderation**: Approval system for new listings

### Image Processing
- **Compression**: Automatic image optimization (20% size reduction)
- **Storage**: Base64 encoding with database storage
- **Serving**: Separate endpoints for photo retrieval
- **Optimization**: Multiple compression levels based on file size

### Admin Panel
- **Integration**: Retool-based administrative interface
- **API**: Dedicated admin endpoints with authentication
- **Features**: User management, listing moderation, statistics

### Mobile Applications
- **Technology**: Capacitor hybrid apps
- **Platforms**: iOS (App Store) and Android (Google Play)
- **Optimization**: Touch-friendly interface with platform-specific adjustments

## Data Flow

### User Registration Flow
1. User enters phone number (+992 format)
2. SMS verification code sent via OsonSMS API
3. Code verification creates new user account
4. Session established for authenticated access

### Auction Participation Flow
1. User browses active auctions
2. Places bid with validation checks
3. Real-time updates to all participants
4. Auction end triggers winner determination

### Content Management Flow
1. Users create listings with photos
2. Admin reviews and approves/rejects
3. Approved listings become active auctions
4. System manages auction lifecycle

## External Dependencies

### SMS Service
- **Provider**: OsonSMS (Tajikistan SMS gateway)
- **Authentication**: Login/hash-based API access
- **Fallback**: Demo mode with server-side code logging

### Database
- **PostgreSQL**: Primary data storage
- **Connection**: Environment variable configuration
- **ORM**: Drizzle for type-safe database operations

### Image Processing
- **Sharp.js**: Image compression and optimization
- **Formats**: JPEG output with quality optimization
- **Caching**: Server-side image processing cache

### Admin Tools
- **Retool**: External admin panel integration
- **API Key**: Secure admin endpoint access
- **Real-time**: Live statistics and management

## Deployment Strategy

### Production Environment
- **Platform**: Replit Deployments
- **Build**: Vite for frontend, esbuild for backend
- **Serving**: Express static file serving
- **Environment**: Production environment variables

### Mobile Deployment
- **Android**: Google Play Store via Android Studio
- **iOS**: App Store via Xcode
- **Build**: Capacitor sync and platform-specific builds

### Development
- **Hot Reload**: Development server with live updates
- **TypeScript**: Full type checking in development
- **Environment**: Separate development configuration

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.