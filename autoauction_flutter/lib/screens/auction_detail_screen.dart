import 'package:flutter/material.dart';

class AuctionDetailScreen extends StatefulWidget {
  final String carId;

  const AuctionDetailScreen({Key? key, required this.carId}) : super(key: key);

  @override
  State<AuctionDetailScreen> createState() => _AuctionDetailScreenState();
}

class _AuctionDetailScreenState extends State<AuctionDetailScreen>
    with TickerProviderStateMixin {
  final TextEditingController _bidController = TextEditingController();
  late AnimationController _timerController;
  
  // Mock data for the detailed car
  final Map<String, dynamic> carData = {
    'id': '1',
    'make': 'BMW',
    'model': 'X5',
    'year': 2020,
    'mileage': 45000,
    'currentBid': 47500,
    'bidCount': 23,
    'endTime': DateTime.now().add(const Duration(days: 2)),
    'specifications': {
      'engine': '3.0L Twin Turbo',
      'transmission': 'Автоматическая 8-ступенчатая',
      'drivetrain': 'Полный привод (xDrive)',
      'fuelType': 'Бензин',
      'bodyType': 'Кроссовер',
      'color': 'Черный металлик',
      'condition': 'Отличное',
      'vin': 'WBXPC9C59WP123456',
      'previousOwners': 1,
      'accidents': 'Без аварий',
      'serviceHistory': 'Полная история обслуживания'
    },
    'seller': 'Официальный дилер BMW',
    'location': 'Москва, Россия',
    'views': 342
  };

  final List<Map<String, dynamic>> biddingHistory = [
    {'bidder': 'Александр К.', 'amount': 47500, 'time': '2 минуты назад', 'isWinning': true},
    {'bidder': 'Марина С.', 'amount': 46800, 'time': '15 минут назад', 'isWinning': false},
    {'bidder': 'Дмитрий П.', 'amount': 46200, 'time': '32 минуты назад', 'isWinning': false},
    {'bidder': 'Елена В.', 'amount': 45500, 'time': '1 час назад', 'isWinning': false},
    {'bidder': 'Сергей Н.', 'amount': 45000, 'time': '2 часа назад', 'isWinning': false},
    {'bidder': 'Анна М.', 'amount': 44200, 'time': '3 часа назад', 'isWinning': false},
    {'bidder': 'Игорь З.', 'amount': 43500, 'time': '5 часов назад', 'isWinning': false},
  ];

  @override
  void initState() {
    super.initState();
    _timerController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _timerController.dispose();
    _bidController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Детали аукциона',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border, color: Colors.black),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.share, color: Colors.black),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 80),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Car Image
            _buildCarImage(),
            
            // Car Specifications
            _buildSpecifications(),
            
            // Countdown Timer
            _buildCountdownTimer(),
            
            // Current Bid and Bidding
            _buildBiddingSection(),
            
            // Bidding History
            _buildBiddingHistory(),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomBiddingBar(),
    );
  }

  Widget _buildCarImage() {
    return Container(
      height: 250,
      width: double.infinity,
      color: Colors.grey[200],
      child: Stack(
        children: [
          const Center(
            child: Icon(
              Icons.directions_car,
              size: 80,
              color: Colors.grey,
            ),
          ),
          Positioned(
            top: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.visibility, color: Colors.white, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${carData['views']}',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCarTitle() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${carData['year']} ${carData['make']} ${carData['model']}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              'Год выпуска: ${carData['year']}',
                              style: TextStyle(color: Colors.grey[600], fontSize: 14),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.speed, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              'Пробег: ${carData['mileage'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')} км',
                              style: TextStyle(color: Colors.grey[600], fontSize: 14),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.build, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Двигатель: ${carData['specifications']['engine']}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.settings, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'КПП: ${carData['specifications']['transmission']}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.drive_eta, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Привод: ${carData['specifications']['drivetrain']}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green[100],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Активный',
                  style: TextStyle(
                    color: Colors.green[800],
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      'Год: ${carData['year']}',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.people, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      'Ставки: ${carData['bidCount']}',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCountdownTimer() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.access_time, color: Colors.blue),
              SizedBox(width: 8),
              Text(
                'Время до окончания аукциона',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          StreamBuilder<DateTime>(
            stream: Stream.periodic(const Duration(seconds: 1), (_) => DateTime.now()),
            builder: (context, snapshot) {
              final now = snapshot.data ?? DateTime.now();
              final difference = carData['endTime'].difference(now);
              
              if (difference.isNegative) {
                return const Text('Аукцион завершен');
              }
              
              final days = difference.inDays;
              final hours = difference.inHours % 24;
              final minutes = difference.inMinutes % 60;
              final seconds = difference.inSeconds % 60;
              
              return Row(
                children: [
                  _buildTimeUnit(days.toString(), 'дней'),
                  const SizedBox(width: 8),
                  _buildTimeUnit(hours.toString().padLeft(2, '0'), 'часов'),
                  const SizedBox(width: 8),
                  _buildTimeUnit(minutes.toString().padLeft(2, '0'), 'минут'),
                  const SizedBox(width: 8),
                  _buildTimeUnit(seconds.toString().padLeft(2, '0'), 'секунд'),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTimeUnit(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.blue[600],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBiddingSection() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Текущая ставка',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Column(
              children: [
                Text(
                  '\$${carData['currentBid'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                Text(
                  'Следующая ставка от \$${(carData['currentBid'] + 500).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecifications() {
    final specs = carData['specifications'] as Map<String, dynamic>;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Характеристики автомобиля',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          ...specs.entries.map((entry) => _buildSpecRow(
            _getSpecLabel(entry.key),
            entry.value.toString(),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildSpecRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey[600]),
          ),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  String _getSpecLabel(String key) {
    switch (key) {
      case 'engine': return 'Двигатель:';
      case 'transmission': return 'КПП:';
      case 'drivetrain': return 'Привод:';
      case 'fuelType': return 'Топливо:';
      case 'bodyType': return 'Кузов:';
      case 'color': return 'Цвет:';
      case 'condition': return 'Состояние:';
      case 'vin': return 'VIN:';
      case 'previousOwners': return 'Владельцев:';
      case 'accidents': return 'Аварии:';
      case 'serviceHistory': return 'Сервис:';
      default: return key;
    }
  }

  Widget _buildBiddingHistory() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'История ставок',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          ...biddingHistory.map((bid) => _buildBidItem(bid)).toList(),
        ],
      ),
    );
  }

  Widget _buildBidItem(Map<String, dynamic> bid) {
    final isWinning = bid['isWinning'] as bool;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isWinning ? Colors.green[50] : Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: isWinning ? Border.all(color: Colors.green[200]!) : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    bid['bidder'],
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                  if (isWinning) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green[600],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'Лидирует',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              Text(
                bid['time'],
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
              ),
            ],
          ),
          Text(
            '\$${bid['amount'].toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isWinning ? Colors.green[600] : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }



  Widget _buildBottomBiddingBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: TextField(
              controller: _bidController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Введите вашу ставку',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Colors.blue),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () {
                if (_bidController.text.isNotEmpty) {
                  final bidAmount = int.tryParse(_bidController.text);
                  if (bidAmount != null && bidAmount > carData['currentBid']) {
                    // Place bid logic here
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Ставка размещена!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                    _bidController.clear();
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Ставка должна быть выше текущей'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[600],
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Сделать ставку',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}