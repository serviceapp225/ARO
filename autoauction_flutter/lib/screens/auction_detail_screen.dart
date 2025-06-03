import 'package:flutter/material.dart';

class AuctionDetailScreen extends StatefulWidget {
  final String auctionId;
  
  const AuctionDetailScreen({super.key, required this.auctionId});

  @override
  State<AuctionDetailScreen> createState() => _AuctionDetailScreenState();
}

class _AuctionDetailScreenState extends State<AuctionDetailScreen> {
  final TextEditingController _bidController = TextEditingController();
  bool _isFavorite = false;
  
  @override
  void dispose() {
    _bidController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auction Details'),
        actions: [
          IconButton(
            onPressed: () {
              setState(() {
                _isFavorite = !_isFavorite;
              });
            },
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? Colors.red : null,
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image carousel
            const _ImageCarousel(),
            
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Car title and countdown
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Expanded(
                        child: Text(
                          '2019 Mercedes-Benz C300',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.shade100,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '2h 45m left',
                          style: TextStyle(
                            color: Colors.red.shade700,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Current bid section
                  const _BidSection(),
                  
                  const SizedBox(height: 24),
                  
                  // Car details
                  const _CarDetails(),
                  
                  const SizedBox(height: 24),
                  
                  // Bidding section
                  _BiddingSection(bidController: _bidController),
                  
                  const SizedBox(height: 24),
                  
                  // Recent bids
                  const _RecentBids(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageCarousel extends StatelessWidget {
  const _ImageCarousel();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 250,
      child: PageView.builder(
        itemCount: 5,
        itemBuilder: (context, index) {
          return Container(
            color: Colors.grey.shade300,
            child: const Center(
              child: Icon(
                Icons.directions_car,
                size: 80,
                color: Colors.grey,
              ),
            ),
          );
        },
      ),
    );
  }
}

class _BidSection extends StatelessWidget {
  const _BidSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Current Highest Bid',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                ),
              ),
              const Text(
                '\$35,500',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Total Bids',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                ),
              ),
              const Text(
                '23',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CarDetails extends StatelessWidget {
  const _CarDetails();

  @override
  Widget build(BuildContext context) {
    final details = [
      {'label': 'Year', 'value': '2019'},
      {'label': 'Mileage', 'value': '45,000 miles'},
      {'label': 'Engine', 'value': '2.0L Turbo'},
      {'label': 'Transmission', 'value': 'Automatic'},
      {'label': 'Color', 'value': 'Silver'},
      {'label': 'Condition', 'value': 'Excellent'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Vehicle Details',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...details.map((detail) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                detail['label']!,
                style: TextStyle(
                  color: Colors.grey.shade600,
                ),
              ),
              Text(
                detail['value']!,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
}

class _BiddingSection extends StatelessWidget {
  final TextEditingController bidController;
  
  const _BiddingSection({required this.bidController});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Place Your Bid',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: bidController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Bid Amount',
                  prefixText: '\$ ',
                  border: OutlineInputBorder(),
                  hintText: '36,000',
                ),
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: () {
                // Handle bid submission
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Bid Placed'),
                    content: Text('Your bid of \$${bidController.text} has been placed!'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('OK'),
                      ),
                    ],
                  ),
                );
              },
              child: const Text('Bid'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Minimum bid: \$36,000',
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

class _RecentBids extends StatelessWidget {
  const _RecentBids();

  @override
  Widget build(BuildContext context) {
    final bids = [
      {'bidder': 'User123', 'amount': '\$35,500', 'time': '2 mins ago'},
      {'bidder': 'AutoLover', 'amount': '\$35,000', 'time': '5 mins ago'},
      {'bidder': 'CarCollector', 'amount': '\$34,500', 'time': '8 mins ago'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Bids',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        ...bids.map((bid) => Card(
          child: ListTile(
            leading: CircleAvatar(
              child: Text(bid['bidder']![0]),
            ),
            title: Text(bid['bidder']!),
            subtitle: Text(bid['time']!),
            trailing: Text(
              bid['amount']!,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
          ),
        )),
      ],
    );
  }
}