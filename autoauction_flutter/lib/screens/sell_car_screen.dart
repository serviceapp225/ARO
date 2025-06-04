import 'package:flutter/material.dart';
import '../data/car_data.dart';

class SellCarScreen extends StatefulWidget {
  const SellCarScreen({super.key});

  @override
  State<SellCarScreen> createState() => _SellCarScreenState();
}

class _SellCarScreenState extends State<SellCarScreen> {
  final _formKey = GlobalKey<FormState>();
  final _yearController = TextEditingController();
  final _mileageController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _startingBidController = TextEditingController();
  final _reservePriceController = TextEditingController();
  
  String? _selectedMake;
  String? _selectedModel;
  String _selectedCondition = 'Excellent';
  String _selectedTransmission = 'Automatic';
  String _selectedFuelType = 'Gasoline';
  DateTime _selectedEndDate = DateTime.now().add(const Duration(days: 7));
  List<String> _uploadedImages = [];

  final List<String> _conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  final List<String> _transmissions = ['Automatic', 'Manual', 'CVT'];
  final List<String> _fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];

  @override
  void dispose() {
    _yearController.dispose();
    _mileageController.dispose();
    _descriptionController.dispose();
    _startingBidController.dispose();
    _reservePriceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sell Your Car'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _SectionHeader(title: 'Vehicle Information'),
              const SizedBox(height: 16),
              
              // Basic info
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _makeController,
                      decoration: const InputDecoration(
                        labelText: 'Make',
                        border: OutlineInputBorder(),
                        hintText: 'e.g. BMW',
                      ),
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _modelController,
                      decoration: const InputDecoration(
                        labelText: 'Model',
                        border: OutlineInputBorder(),
                        hintText: 'e.g. X5',
                      ),
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _yearController,
                      decoration: const InputDecoration(
                        labelText: 'Year',
                        border: OutlineInputBorder(),
                        hintText: '2020',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _mileageController,
                      decoration: const InputDecoration(
                        labelText: 'Mileage',
                        border: OutlineInputBorder(),
                        hintText: '50000',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Dropdowns
              _buildDropdown(
                'Condition',
                _selectedCondition,
                _conditions,
                (value) => setState(() => _selectedCondition = value!),
              ),
              
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _buildDropdown(
                      'Transmission',
                      _selectedTransmission,
                      _transmissions,
                      (value) => setState(() => _selectedTransmission = value!),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildDropdown(
                      'Fuel Type',
                      _selectedFuelType,
                      _fuelTypes,
                      (value) => setState(() => _selectedFuelType = value!),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Description
              const _SectionHeader(title: 'Description'),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Vehicle Description',
                  border: OutlineInputBorder(),
                  hintText: 'Describe your vehicle\'s features, condition, and history...',
                ),
                maxLines: 4,
                validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
              ),
              
              const SizedBox(height: 24),
              
              // Photos
              const _SectionHeader(title: 'Photos'),
              const SizedBox(height: 16),
              
              _ImageUploadSection(
                uploadedImages: _uploadedImages,
                onImagesChanged: (images) => setState(() => _uploadedImages = images),
              ),
              
              const SizedBox(height: 24),
              
              // Auction Settings
              const _SectionHeader(title: 'Auction Settings'),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _startingBidController,
                      decoration: const InputDecoration(
                        labelText: 'Starting Bid',
                        border: OutlineInputBorder(),
                        prefixText: '\$ ',
                        hintText: '25000',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _reservePriceController,
                      decoration: const InputDecoration(
                        labelText: 'Reserve Price (Optional)',
                        border: OutlineInputBorder(),
                        prefixText: '\$ ',
                        hintText: '30000',
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Auction end date
              _buildDatePicker(),
              
              const SizedBox(height: 32),
              
              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitListing,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text(
                    'Create Auction Listing',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown(
    String label,
    String value,
    List<String> items,
    ValueChanged<String?> onChanged,
  ) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      items: items
          .map((item) => DropdownMenuItem(
                value: item,
                child: Text(item),
              ))
          .toList(),
      onChanged: onChanged,
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: _selectedEndDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 30)),
        );
        if (date != null) {
          setState(() => _selectedEndDate = date);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade400),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Auction End Date: ${_selectedEndDate.day}/${_selectedEndDate.month}/${_selectedEndDate.year}',
              style: const TextStyle(fontSize: 16),
            ),
            const Icon(Icons.calendar_today),
          ],
        ),
      ),
    );
  }

  void _submitListing() {
    if (_formKey.currentState!.validate()) {
      // Handle form submission
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Listing Created'),
          content: const Text('Your car auction listing has been submitted for review!'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}

class _ImageUploadSection extends StatelessWidget {
  final List<String> uploadedImages;
  final ValueChanged<List<String>> onImagesChanged;

  const _ImageUploadSection({
    required this.uploadedImages,
    required this.onImagesChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Upload at least 5 photos of your vehicle',
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: uploadedImages.length + 1,
            itemBuilder: (context, index) {
              if (index == uploadedImages.length) {
                return _buildAddPhotoCard();
              }
              return _buildImageCard(uploadedImages[index], index);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAddPhotoCard() {
    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 8),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
        borderRadius: BorderRadius.circular(8),
      ),
      child: InkWell(
        onTap: () {
          // Handle image upload
          final newImages = List<String>.from(uploadedImages);
          newImages.add('image_${uploadedImages.length + 1}');
          onImagesChanged(newImages);
        },
        borderRadius: BorderRadius.circular(8),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate, size: 32, color: Colors.grey),
            SizedBox(height: 4),
            Text('Add Photo', style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildImageCard(String imagePath, int index) {
    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 8),
      decoration: BoxDecoration(
        color: Colors.grey.shade300,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Stack(
        children: [
          const Center(
            child: Icon(Icons.image, size: 32),
          ),
          Positioned(
            top: 4,
            right: 4,
            child: InkWell(
              onTap: () {
                final newImages = List<String>.from(uploadedImages);
                newImages.removeAt(index);
                onImagesChanged(newImages);
              },
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.close,
                  size: 16,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}