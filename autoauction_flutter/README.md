# AUTOAUCTION - Flutter Car Auction Marketplace

A comprehensive Flutter mobile application for car auctions with clean architecture and organized screen structure.

## 📱 App Structure

### Screens Organization
All screens are organized in the `lib/screens/` directory:

- `home_screen.dart` - Main dashboard with featured auctions and categories
- `auction_feed.dart` - Browse all active auctions with filtering
- `auction_detail_screen.dart` - Detailed auction view with bidding functionality
- `search_screen.dart` - Advanced search with filters and sorting
- `sell_car_screen.dart` - Complete car listing form for sellers
- `my_bids_screen.dart` - User's bid history with tabs (Active/Won/Lost)
- `profile_screen.dart` - User profile management and settings
- `login_screen.dart` - Authentication with login/register tabs

### Navigation Structure
The app uses a bottom navigation bar with 6 main sections:
- **Home** - Featured content and quick access
- **Auctions** - Live auction feed
- **Search** - Find specific vehicles
- **Sell** - List your car for auction
- **My Bids** - Track your bidding activity
- **Profile** - Account management

## 🚀 Running the Project

### Prerequisites
- Flutter SDK installed
- A mobile device/emulator or web browser for testing

### Installation & Setup
1. Navigate to the Flutter project directory:
   ```bash
   cd autoauction_flutter
   ```

2. Get dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   # For mobile development
   flutter run
   
   # For web development
   flutter run -d web
   ```

## 🧪 Testing Individual Screens

Each screen can be tested independently using the navigation routes:

```dart
// Navigate to specific screens programmatically
Navigator.pushNamed(context, '/login');
Navigator.pushNamed(context, '/');  // Home with bottom nav
Navigator.pushNamed(context, '/auctions');
Navigator.pushNamed(context, '/search');
Navigator.pushNamed(context, '/sell-car');
Navigator.pushNamed(context, '/my-bids');
Navigator.pushNamed(context, '/profile');
Navigator.pushNamed(context, '/auction-detail', arguments: 'auction_id');
```

## 🏗️ Architecture Features

### Clean Code Structure
- Separate files for each screen
- Modular widget components within screens
- Consistent naming conventions
- Proper import organization

### Material Design 3
- Modern UI components
- Consistent theming
- Responsive design
- Proper accessibility support

### Navigation System
- Named routes for easy navigation
- Bottom navigation bar for main sections
- Proper route parameter passing
- Back navigation handling

## 🎨 UI Components

### Reusable Components
Each screen contains internal widgets that can be extracted as reusable components:
- `_SectionHeader` - Consistent section titles
- `_StatCard` - Statistics display cards
- `_FilterDropdown` - Search filter components
- `_BidCard` - Auction item display cards

### Design Patterns
- Card-based layouts for content organization
- Consistent spacing and padding
- Color-coded status indicators
- Responsive grid and list layouts

## 📦 Key Features Implemented

### Home Screen
- Hero section with call-to-action
- Featured auctions carousel
- Category grid navigation
- Quick access to main features

### Auction Features
- Live auction feed with filtering
- Detailed auction pages with image carousels
- Real-time bidding interface
- Countdown timers for auction endings

### Search & Discovery
- Advanced filtering (price, year, make, etc.)
- Sort options (price, time, popularity)
- Modal bottom sheet for detailed filters
- Search results with compact card layout

### User Management
- Complete authentication flow
- User profile with statistics
- Bid history tracking
- Settings and preferences

### Selling Features
- Comprehensive car listing form
- Image upload functionality
- Auction duration settings
- Form validation and submission

## 🔧 Development Tips

### Adding New Screens
1. Create new `.dart` file in `lib/screens/`
2. Add route in `main.dart` routes map
3. Add navigation destination if needed in bottom nav

### Customizing Themes
Modify theme properties in `main.dart`:
```dart
theme: ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
  // Add your custom theme properties
),
```

### Testing Navigation
Use the built-in test routes or create your own navigation testing by temporarily changing the `initialRoute` in `main.dart`.

## 📱 Platform Support
- **iOS** - Full native support
- **Android** - Full native support  
- **Web** - Responsive web support
- **Desktop** - Can be adapted for desktop platforms

## 🚀 Next Steps for Production

### Backend Integration
- Replace mock data with real API calls
- Implement authentication service
- Add real-time bidding with WebSockets
- Connect to payment processing

### Enhanced Features
- Push notifications for bid updates
- Image upload and storage
- Advanced search algorithms
- Social features (user ratings, comments)

---

This Flutter AUTOAUCTION app provides a solid foundation for a car auction marketplace with clean architecture, organized screens, and scalable navigation structure.