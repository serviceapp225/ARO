# AutoAuction Platform - AUTOBID.TJ

## Overview

AUTOBID.TJ is a comprehensive car auction platform built as a full-stack web application with mobile-responsive design. The platform enables users to participate in car auctions, place bids, manage favorites, and sell vehicles through an intuitive interface.

## System Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React + TypeScript with Vite build system
- **Backend**: Express.js with TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Optimized for Replit with production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Key Components

### Frontend Architecture
- **React SPA** with wouter for client-side routing
- **Component Library**: shadcn/ui for consistent UI components
- **State Management**: React Context API for global state (Auth, Auctions, Favorites, Alerts)
- **Data Fetching**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **Mobile-First**: Responsive design with bottom navigation for mobile users

### Backend Architecture
- **REST API** built with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Session-based auth with user activation system
- **File Handling**: Image compression with Sharp.js for optimal performance
- **Admin API**: Dedicated endpoints for administrative operations

### Database Schema
Key entities include:
- **Users**: Authentication, profiles, and activation status
- **Car Listings**: Vehicle details, auction parameters, and status
- **Bids**: Real-time bidding system with validation
- **Favorites**: User preference tracking
- **Notifications**: System alerts and updates
- **Car Alerts**: User-defined search alerts
- **Banners**: Advertisement and promotional content

## Data Flow

1. **User Registration/Login**: Email-based authentication with activation workflow
2. **Auction Browsing**: Real-time auction data with optimized image loading
3. **Bidding Process**: Validated bid placement with immediate feedback
4. **Favorites Management**: Client-side state synchronized with server
5. **Admin Operations**: Separate admin interface for content moderation

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **sharp**: Image processing and optimization
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React routing

### Development Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **esbuild**: Fast JavaScript bundling

## Deployment Strategy

The application is optimized for Replit deployment with multiple build strategies:

1. **Development Mode**: Hot-reload with tsx and Vite dev server
2. **Production Mode**: Built assets served by Express with static file optimization
3. **Image Optimization**: Automatic compression (1.2MB → 150-180KB) with caching
4. **API Performance**: Reduced payload size from 9MB to 6.3KB through selective data loading
5. **Fallback Systems**: Multiple deployment scripts for different environments

### Performance Optimizations
- **Image Compression**: Sharp.js with quality-based optimization
- **API Optimization**: Removed inline base64 images, implemented URL endpoints
- **Caching Strategy**: Multi-level caching (server, HTTP headers, browser)
- **Database Optimization**: Selective queries, excluded heavy fields from list operations

### Admin Integration
- **Retool Admin Panel**: Complete setup documentation for external admin interface
- **Admin API**: Dedicated endpoints for user management, content moderation
- **SMS Integration**: Ready-to-implement SMS verification system

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.