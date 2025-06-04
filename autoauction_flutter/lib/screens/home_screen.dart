import 'package:flutter/material.dart';
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: SafeArea(
        child: Column(
          children: [
            // Top Section with App Title and WhatsApp
            const _TopHeader(),

            // Search Bar and Sell Button
            const _SearchSection(),

            // Main Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),

                    // Announcement Banners
                    const _AnnouncementBanners(),
                    const SizedBox(height: 24),

                    // Active Auctions Grid
                    const _SectionTitle(title: 'Active Auctions'),
                    const SizedBox(height: 12),
                    const _ActiveAuctionsGrid(),
                    const SizedBox(height: 100), // Bottom padding for navigation
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// Top Header with App Title and WhatsApp
class _TopHeader extends StatelessWidget {
  const _TopHeader();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'AUTOAUCTION',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              borderRadius: BorderRadius.circular(25),
            ),
            child: IconButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening WhatsApp support...')),
                );
              },
              icon: Icon(
                Icons.chat,
                color: Colors.green.shade600,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
// Search Section with Search Bar and Sell Button
class _SearchSection extends StatelessWidget {
  const _SearchSection();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pushNamed(context, '/sell-car'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue.shade600,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
          ),
          child: const Text(
            'Sell Your Car',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
// Announcement Banners - Large Advertisement Column
class _AnnouncementBanners extends StatelessWidget {
  const _AnnouncementBanners();
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Large Main Advertisement Banner
        Container(
          width: double.infinity,
          height: 180,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.blue.shade600, Colors.purple.shade700],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20,
                top: -10,
                child: Icon(
                  Icons.directions_car,
                  size: 120,
                  color: Colors.white.withOpacity(0.2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'ПРЕМИУМ АУКЦИОН',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Эксклюзивные автомобили\nот проверенных дилеров',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Участвовать →',
                        style: TextStyle(
                          color: Colors.blue.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),



        // News/Info Banner
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.green.shade50,
            border: Border.all(color: Colors.green.shade200),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(
                Icons.verified_user,
                color: Colors.green.shade600,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Безопасные сделки',
                      style: TextStyle(
                        color: Colors.green.shade800,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Все автомобили проходят проверку',
                      style: TextStyle(
                        color: Colors.green.shade600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
// Section Title Widget
class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});
  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      ),
    );
  }
}
// Active Auctions Grid (2 per row)
class _ActiveAuctionsGrid extends StatelessWidget {
  const _ActiveAuctionsGrid();
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: 6,
      itemBuilder: (context, index) {
        return _AuctionCard(
          title: 'BMW X5 2020',
          year: '2020',
          currentBid: '\$45,${index + 1}00',
          timeLeft: '2h ${30 + index}m',
          index: index,
        );
      },
    );
  }
}
// Individual Auction Card
class _AuctionCard extends StatelessWidget {
  final String title;
  final String year;
  final String currentBid;
  final String timeLeft;
  final int index;
  const _AuctionCard({
    required this.title,
    required this.year,
    required this.currentBid,
    required this.timeLeft,
    required this.index,
  });
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        '/auction-detail',
        arguments: 'auction_$index',
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Car Image
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: const Center(
                child: Icon(
                  Icons.directions_car,
                  size: 40,
                  color: Colors.grey,
                ),
              ),
            ),

            // Car Details
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    year,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    currentBid,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.green.shade600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      timeLeft,
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.orange.shade700,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}