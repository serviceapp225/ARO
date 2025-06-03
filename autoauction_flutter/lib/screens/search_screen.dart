import 'package:flutter/material.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedMake = 'All Makes';
  RangeValues _priceRange = const RangeValues(0, 100000);
  int _selectedYear = 2020;
  String _sortBy = 'Price: Low to High';

  final List<String> _carMakes = [
    'All Makes', 'BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda', 'Ford', 'Chevrolet'
  ];

  final List<String> _sortOptions = [
    'Price: Low to High', 'Price: High to Low', 'Year: Newest', 'Year: Oldest', 'Ending Soon'
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Cars'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          // Search and filters
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Search bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by make, model, or keyword...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    suffixIcon: IconButton(
                      onPressed: () => _showFilters(),
                      icon: const Icon(Icons.tune),
                    ),
                  ),
                  onSubmitted: (value) => _performSearch(),
                ),
                const SizedBox(height: 16),
                
                // Quick filters
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _FilterDropdown(
                        value: _selectedMake,
                        items: _carMakes,
                        onChanged: (value) => setState(() => _selectedMake = value!),
                      ),
                      const SizedBox(width: 12),
                      _FilterDropdown(
                        value: _sortBy,
                        items: _sortOptions,
                        onChanged: (value) => setState(() => _sortBy = value!),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Results
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: 8,
              itemBuilder: (context, index) {
                return _SearchResultCard(
                  carName: 'BMW X5 2020',
                  currentBid: 45000 + (index * 2000),
                  timeLeft: '3h 20m',
                  location: 'Los Angeles, CA',
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _performSearch() {
    // Implement search logic
    setState(() {});
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _FilterBottomSheet(
        priceRange: _priceRange,
        selectedYear: _selectedYear,
        onPriceRangeChanged: (range) => setState(() => _priceRange = range),
        onYearChanged: (year) => setState(() => _selectedYear = year),
      ),
    );
  }
}

class _FilterDropdown extends StatelessWidget {
  final String value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _FilterDropdown({
    required this.value,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButton<String>(
        value: value,
        items: items
            .map((item) => DropdownMenuItem(
                  value: item,
                  child: Text(item),
                ))
            .toList(),
        onChanged: onChanged,
        underline: const SizedBox(),
      ),
    );
  }
}

class _SearchResultCard extends StatelessWidget {
  final String carName;
  final int currentBid;
  final String timeLeft;
  final String location;

  const _SearchResultCard({
    required this.carName,
    required this.currentBid,
    required this.timeLeft,
    required this.location,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, '/auction-detail'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
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
              const SizedBox(width: 12),
              
              // Car details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      carName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      location,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '\$${currentBid.toString().replaceAllMapped(
                            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                            (Match m) => '${m[1]},',
                          )}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            timeLeft,
                            style: TextStyle(
                              color: Colors.orange.shade700,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterBottomSheet extends StatefulWidget {
  final RangeValues priceRange;
  final int selectedYear;
  final ValueChanged<RangeValues> onPriceRangeChanged;
  final ValueChanged<int> onYearChanged;

  const _FilterBottomSheet({
    required this.priceRange,
    required this.selectedYear,
    required this.onPriceRangeChanged,
    required this.onYearChanged,
  });

  @override
  State<_FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<_FilterBottomSheet> {
  late RangeValues _tempPriceRange;
  late int _tempSelectedYear;

  @override
  void initState() {
    super.initState();
    _tempPriceRange = widget.priceRange;
    _tempSelectedYear = widget.selectedYear;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Filters',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          
          // Price range
          const Text(
            'Price Range',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          RangeSlider(
            values: _tempPriceRange,
            min: 0,
            max: 200000,
            divisions: 20,
            labels: RangeLabels(
              '\$${_tempPriceRange.start.round()}',
              '\$${_tempPriceRange.end.round()}',
            ),
            onChanged: (values) => setState(() => _tempPriceRange = values),
          ),
          
          const SizedBox(height: 24),
          
          // Year
          const Text(
            'Minimum Year',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Slider(
            value: _tempSelectedYear.toDouble(),
            min: 2000,
            max: 2024,
            divisions: 24,
            label: _tempSelectedYear.toString(),
            onChanged: (value) => setState(() => _tempSelectedYear = value.round()),
          ),
          
          const SizedBox(height: 32),
          
          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    widget.onPriceRangeChanged(_tempPriceRange);
                    widget.onYearChanged(_tempSelectedYear);
                    Navigator.pop(context);
                  },
                  child: const Text('Apply'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}