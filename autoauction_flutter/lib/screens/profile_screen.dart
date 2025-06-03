import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameController = TextEditingController(text: 'John Doe');
  final _emailController = TextEditingController(text: 'john.doe@email.com');
  final _phoneController = TextEditingController(text: '+1 (555) 123-4567');
  bool _notificationsEnabled = true;
  bool _emailAlerts = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            onPressed: _saveProfile,
            icon: const Icon(Icons.save),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile picture section
            const _ProfilePictureSection(),
            const SizedBox(height: 32),
            
            // Personal information
            const _SectionHeader(title: 'Personal Information'),
            const SizedBox(height: 16),
            
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            
            const SizedBox(height: 16),
            
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            
            const SizedBox(height: 16),
            
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
            ),
            
            const SizedBox(height: 32),
            
            // Account stats
            const _SectionHeader(title: 'Account Statistics'),
            const SizedBox(height: 16),
            
            const Row(
              children: [
                Expanded(child: _StatCard(title: 'Bids Placed', value: '23')),
                SizedBox(width: 16),
                Expanded(child: _StatCard(title: 'Auctions Won', value: '5')),
              ],
            ),
            
            const SizedBox(height: 16),
            
            const Row(
              children: [
                Expanded(child: _StatCard(title: 'Cars Sold', value: '2')),
                SizedBox(width: 16),
                Expanded(child: _StatCard(title: 'Member Since', value: '2023')),
              ],
            ),
            
            const SizedBox(height: 32),
            
            // Preferences
            const _SectionHeader(title: 'Preferences'),
            const SizedBox(height: 16),
            
            Card(
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Push Notifications'),
                    subtitle: const Text('Receive bid alerts and updates'),
                    value: _notificationsEnabled,
                    onChanged: (value) => setState(() => _notificationsEnabled = value),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Email Alerts'),
                    subtitle: const Text('Get auction updates via email'),
                    value: _emailAlerts,
                    onChanged: (value) => setState(() => _emailAlerts = value),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Action buttons
            const _SectionHeader(title: 'Account Actions'),
            const SizedBox(height: 16),
            
            _buildActionButton(
              'Payment Methods',
              Icons.credit_card,
              () => _showComingSoon(context),
            ),
            
            const SizedBox(height: 12),
            
            _buildActionButton(
              'Shipping Addresses',
              Icons.local_shipping,
              () => _showComingSoon(context),
            ),
            
            const SizedBox(height: 12),
            
            _buildActionButton(
              'Help & Support',
              Icons.help,
              () => _showComingSoon(context),
            ),
            
            const SizedBox(height: 12),
            
            _buildActionButton(
              'Terms & Privacy',
              Icons.privacy_tip,
              () => _showComingSoon(context),
            ),
            
            const SizedBox(height: 32),
            
            // Logout button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: _logout,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Logout'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(String title, IconData icon, VoidCallback onTap) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }

  void _saveProfile() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Profile updated successfully!')),
    );
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Feature coming soon!')),
    );
  }
}

class _ProfilePictureSection extends StatelessWidget {
  const _ProfilePictureSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          children: [
            CircleAvatar(
              radius: 60,
              backgroundColor: Colors.grey.shade300,
              child: const Icon(Icons.person, size: 60),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  onPressed: () {
                    // Handle profile picture change
                  },
                  icon: const Icon(Icons.camera_alt, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text(
          'John Doe',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.green.shade100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            'Verified Member',
            style: TextStyle(
              color: Colors.green.shade700,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  
  const _StatCard({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}