# AutoBid - Car Auction Platform

## Project Overview
Comprehensive auto auction platform for the Tajikistan market with web application, mobile apps (iOS/Android), and administrative moderation system. Features multi-language support (Tajik/Russian), real-time auctions, and SMS-based authentication.

## Current Status
- **Platform State**: Fully operational with authentication bypass system
- **Database**: SQLite migration completed successfully
- **Car Listings**: Creation functionality working with automatic field generation
- **Admin Panel**: Separate Retool-based system configured
- **Mobile Apps**: Capacitor framework ready for deployment

## Recent Changes (December 2024)
- ✅ Fixed car listing creation validation errors and SQL parameter issues
- ✅ Implemented automatic lot number generation (LOT######)
- ✅ Resolved timestamp field handling for SQLite database
- ✅ Enhanced data enrichment with default values
- ✅ All new listings set to "pending" status for moderation
- ✅ Successfully created and activated multiple car listings
- ✅ Fixed Drizzle ORM timestamp issues by reverting to direct ORM usage
- ✅ Car listing creation now stable with photo support capability
- ✅ Currently 11 active listings including luxury supercars (BMW, Toyota, Mercedes, Audi, Lexus, Ferrari, Lamborghini, McLaren, Bugatti)
- ✅ Removed pending status - all new listings are immediately active and visible
- ✅ Car creation workflow simplified: create → instantly visible in auction list

## User Preferences
- **Language**: Russian interface preferred
- **Communication Style**: Direct, technical explanations
- **Error Handling**: Detailed logging and validation
- **Development Approach**: Focus on stability and user experience
- **Listing Creation**: User requires all new listings to appear immediately in auction list without pending status
- **No Moderation**: Skip pending/approval workflow for faster listing visibility

## Technical Architecture

### Frontend
- **Framework**: React with Vite
- **Routing**: Wouter
- **UI**: Shadcn components with Tailwind CSS
- **State Management**: TanStack Query
- **Authentication**: Bypass system implemented

### Backend  
- **Runtime**: Node.js with Express
- **Database**: SQLite with Drizzle ORM
- **Authentication**: SMS bypass for development
- **API**: RESTful endpoints with validation

### Database Schema
- **Users**: Full profile management
- **Car Listings**: Comprehensive auction data
- **Bids**: Real-time bidding system
- **Notifications**: Alert system
- **Admin**: Moderation capabilities

### Key Features
1. **Car Listing Creation**: Automatic field generation and validation
2. **Auction Management**: Duration, bidding, status tracking
3. **User Management**: Profile, favorites, alerts
4. **Admin Moderation**: Retool-based admin panel
5. **Mobile Support**: Capacitor for native apps

## API Endpoints
- `POST /api/listings` - Create car listing (working)
- `GET /api/listings?status=pending` - View pending listings
- `GET /api/listings` - Active listings only
- `GET /api/users/{id}` - User profile
- Admin endpoints for moderation

## Known Issues
- Minor notification system errors (column naming)
- Some admin panel integrations pending
- SMS service configuration needed for production

## Next Steps
- Activate pending listings through admin panel
- Complete mobile app configuration
- Production SMS service integration
- Performance optimization