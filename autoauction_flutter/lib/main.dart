import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/auction_feed.dart';
import 'screens/auction_detail_screen.dart';
import 'screens/search_screen.dart';
import 'screens/sell_car_screen.dart';
import 'screens/my_bids_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const AutoAuctionApp());
}

class AutoAuctionApp extends StatelessWidget {
  const AutoAuctionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AUTOAUCTION',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 2,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      // Start with home screen to show updated design
      initialRoute: '/',
      routes: {
        '/': (context) => const MainNavigation(),
        '/login': (context) => const LoginScreen(),
        '/auctions': (context) => const AuctionFeedScreen(),
        '/auction-detail': (context) {
          final auctionId = ModalRoute.of(context)?.settings.arguments as String?;
          return AuctionDetailScreen(auctionId: auctionId ?? 'sample_auction');
        },
        '/search': (context) => const SearchScreen(),
        '/sell-car': (context) => const SellCarScreen(),
        '/my-bids': (context) => const MyBidsScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;
  
  final List<Widget> _screens = [
    const HomeScreen(),
    const AuctionFeedScreen(),
    const SearchScreen(),
    const SellCarScreen(),
    const MyBidsScreen(),
    const ProfileScreen(),
  ];

  final List<NavigationDestination> _destinations = [
    const NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: 'Home',
    ),
    const NavigationDestination(
      icon: Icon(Icons.gavel_outlined),
      selectedIcon: Icon(Icons.gavel),
      label: 'Auctions',
    ),
    const NavigationDestination(
      icon: Icon(Icons.search_outlined),
      selectedIcon: Icon(Icons.search),
      label: 'Search',
    ),
    const NavigationDestination(
      icon: Icon(Icons.sell_outlined),
      selectedIcon: Icon(Icons.sell),
      label: 'Sell',
    ),
    const NavigationDestination(
      icon: Icon(Icons.format_list_bulleted_outlined),
      selectedIcon: Icon(Icons.format_list_bulleted),
      label: 'My Bids',
    ),
    const NavigationDestination(
      icon: Icon(Icons.person_outlined),
      selectedIcon: Icon(Icons.person),
      label: 'Profile',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: _destinations,
      ),
    );
  }
}

// Test route widget for easy development and testing
class TestRoutes extends StatelessWidget {
  const TestRoutes({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test All Screens'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'AUTOAUCTION - Screen Navigator',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            
            _buildTestButton(context, 'Login Screen', '/login'),
            _buildTestButton(context, 'Home Screen', '/'),
            _buildTestButton(context, 'Auction Feed', '/auctions'),
            _buildTestButton(context, 'Auction Detail', '/auction-detail'),
            _buildTestButton(context, 'Search Screen', '/search'),
            _buildTestButton(context, 'Sell Car', '/sell-car'),
            _buildTestButton(context, 'My Bids', '/my-bids'),
            _buildTestButton(context, 'Profile', '/profile'),
            
            const SizedBox(height: 32),
            
            const Text(
              'Use this screen to test navigation to all screens independently.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestButton(BuildContext context, String title, String route) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: ElevatedButton(
        onPressed: () => Navigator.pushNamed(context, route),
        child: Text(title),
      ),
    );
  }
}