import 'package:flutter/material.dart';

class MyBidsScreen extends StatefulWidget {
  const MyBidsScreen({super.key});

  @override
  State<MyBidsScreen> createState() => _MyBidsScreenState();
}

class _MyBidsScreenState extends State<MyBidsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Bids'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Won'),
            Tab(text: 'Lost'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ActiveBidsTab(),
          _WonBidsTab(),
          _LostBidsTab(),
        ],
      ),
    );
  }
}

class _ActiveBidsTab extends StatelessWidget {
  const _ActiveBidsTab();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return _BidCard(
          carName: '2020 BMW X5',
          myBid: 45000 + (index * 1000),
          currentHighestBid: 46000 + (index * 1000),
          timeLeft: '2h 30m',
          isLeading: index % 2 == 0,
          status: BidStatus.active,
        );
      },
    );
  }
}

class _WonBidsTab extends StatelessWidget {
  const _WonBidsTab();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 3,
      itemBuilder: (context, index) {
        return _BidCard(
          carName: '2019 Mercedes C300',
          myBid: 35000 + (index * 2000),
          currentHighestBid: 35000 + (index * 2000),
          timeLeft: 'Ended',
          isLeading: true,
          status: BidStatus.won,
        );
      },
    );
  }
}

class _LostBidsTab extends StatelessWidget {
  const _LostBidsTab();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) {
        return _BidCard(
          carName: '2018 Audi A4',
          myBid: 28000 + (index * 1500),
          currentHighestBid: 30000 + (index * 1500),
          timeLeft: 'Ended',
          isLeading: false,
          status: BidStatus.lost,
        );
      },
    );
  }
}

enum BidStatus { active, won, lost }

class _BidCard extends StatelessWidget {
  final String carName;
  final int myBid;
  final int currentHighestBid;
  final String timeLeft;
  final bool isLeading;
  final BidStatus status;

  const _BidCard({
    required this.carName,
    required this.myBid,
    required this.currentHighestBid,
    required this.timeLeft,
    required this.isLeading,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Car image placeholder
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.directions_car, size: 32),
                ),
                const SizedBox(width: 16),
                
                // Car details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        carName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _buildStatusChip(),
                      const SizedBox(height: 8),
                      Text(
                        timeLeft,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Bid information
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'My Bid',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      '\$${_formatCurrency(myBid)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Current Highest',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      '\$${_formatCurrency(currentHighestBid)}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _getHighestBidColor(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            if (status == BidStatus.active) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pushNamed(context, '/auction-detail'),
                      child: const Text('View Auction'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isLeading ? null : () => _showIncreaseBidDialog(context),
                      child: Text(isLeading ? 'Leading' : 'Increase Bid'),
                    ),
                  ),
                ],
              ),
            ],
            
            if (status == BidStatus.won) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _showPaymentDialog(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Complete Purchase'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip() {
    Color backgroundColor;
    Color textColor;
    String text;

    switch (status) {
      case BidStatus.active:
        if (isLeading) {
          backgroundColor = Colors.green.shade100;
          textColor = Colors.green.shade700;
          text = 'Leading';
        } else {
          backgroundColor = Colors.orange.shade100;
          textColor = Colors.orange.shade700;
          text = 'Outbid';
        }
        break;
      case BidStatus.won:
        backgroundColor = Colors.green.shade100;
        textColor = Colors.green.shade700;
        text = 'Won';
        break;
      case BidStatus.lost:
        backgroundColor = Colors.red.shade100;
        textColor = Colors.red.shade700;
        text = 'Lost';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getHighestBidColor() {
    if (status == BidStatus.active) {
      return isLeading ? Colors.green : Colors.red;
    }
    return Colors.grey.shade700;
  }

  String _formatCurrency(int amount) {
    return amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  void _showIncreaseBidDialog(BuildContext context) {
    final TextEditingController bidController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Increase Your Bid'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Current highest bid: \$${_formatCurrency(currentHighestBid)}'),
            const SizedBox(height: 16),
            TextField(
              controller: bidController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Your new bid',
                prefixText: '\$ ',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Bid updated successfully!')),
              );
            },
            child: const Text('Place Bid'),
          ),
        ],
      ),
    );
  }

  void _showPaymentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Congratulations!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('You won this auction!'),
            const SizedBox(height: 16),
            Text('Final price: \$${_formatCurrency(myBid)}'),
            const SizedBox(height: 8),
            const Text('Please proceed with payment and arrange pickup.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to payment screen
            },
            child: const Text('Pay Now'),
          ),
        ],
      ),
    );
  }
}