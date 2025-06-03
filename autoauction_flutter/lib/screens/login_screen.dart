import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _loginFormKey = GlobalKey<FormState>();
  final _registerFormKey = GlobalKey<FormState>();

  // Login form controllers
  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  // Register form controllers
  final _registerNameController = TextEditingController();
  final _registerEmailController = TextEditingController();
  final _registerPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isLoginPasswordVisible = false;
  bool _isRegisterPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  bool _agreeToTerms = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _registerNameController.dispose();
    _registerEmailController.dispose();
    _registerPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const SizedBox(height: 40),
                
                // Logo and title
                const _AppLogo(),
                const SizedBox(height: 40),
                
                // Tab bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(
                      color: Theme.of(context).primaryColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.grey.shade600,
                    tabs: const [
                      Tab(text: 'Login'),
                      Tab(text: 'Register'),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Tab content
                SizedBox(
                  height: 500,
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildLoginForm(),
                      _buildRegisterForm(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return Form(
      key: _loginFormKey,
      child: Column(
        children: [
          TextFormField(
            controller: _loginEmailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.email),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Email is required';
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value!)) {
                return 'Enter a valid email';
              }
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          TextFormField(
            controller: _loginPasswordController,
            obscureText: !_isLoginPasswordVisible,
            decoration: InputDecoration(
              labelText: 'Password',
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.lock),
              suffixIcon: IconButton(
                onPressed: () => setState(() => _isLoginPasswordVisible = !_isLoginPasswordVisible),
                icon: Icon(_isLoginPasswordVisible ? Icons.visibility : Icons.visibility_off),
              ),
            ),
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Password is required';
              return null;
            },
          ),
          
          const SizedBox(height: 8),
          
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: _showForgotPasswordDialog,
              child: const Text('Forgot Password?'),
            ),
          ),
          
          const SizedBox(height: 24),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _login,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Login', style: TextStyle(fontSize: 16)),
            ),
          ),
          
          const SizedBox(height: 24),
          
          const Row(
            children: [
              Expanded(child: Divider()),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('OR'),
              ),
              Expanded(child: Divider()),
            ],
          ),
          
          const SizedBox(height: 24),
          
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _loginWithGoogle,
              icon: const Icon(Icons.login),
              label: const Text('Continue with Google'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRegisterForm() {
    return Form(
      key: _registerFormKey,
      child: Column(
        children: [
          TextFormField(
            controller: _registerNameController,
            decoration: const InputDecoration(
              labelText: 'Full Name',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.person),
            ),
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Name is required';
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          TextFormField(
            controller: _registerEmailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.email),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Email is required';
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value!)) {
                return 'Enter a valid email';
              }
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          TextFormField(
            controller: _registerPasswordController,
            obscureText: !_isRegisterPasswordVisible,
            decoration: InputDecoration(
              labelText: 'Password',
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.lock),
              suffixIcon: IconButton(
                onPressed: () => setState(() => _isRegisterPasswordVisible = !_isRegisterPasswordVisible),
                icon: Icon(_isRegisterPasswordVisible ? Icons.visibility : Icons.visibility_off),
              ),
            ),
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Password is required';
              if (value!.length < 6) return 'Password must be at least 6 characters';
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          TextFormField(
            controller: _confirmPasswordController,
            obscureText: !_isConfirmPasswordVisible,
            decoration: InputDecoration(
              labelText: 'Confirm Password',
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.lock),
              suffixIcon: IconButton(
                onPressed: () => setState(() => _isConfirmPasswordVisible = !_isConfirmPasswordVisible),
                icon: Icon(_isConfirmPasswordVisible ? Icons.visibility : Icons.visibility_off),
              ),
            ),
            validator: (value) {
              if (value?.isEmpty ?? true) return 'Please confirm your password';
              if (value != _registerPasswordController.text) return 'Passwords do not match';
              return null;
            },
          ),
          
          const SizedBox(height: 16),
          
          CheckboxListTile(
            value: _agreeToTerms,
            onChanged: (value) => setState(() => _agreeToTerms = value ?? false),
            title: const Text(
              'I agree to the Terms of Service and Privacy Policy',
              style: TextStyle(fontSize: 14),
            ),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
          ),
          
          const SizedBox(height: 24),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _agreeToTerms ? _register : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Create Account', style: TextStyle(fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  void _login() {
    if (_loginFormKey.currentState!.validate()) {
      // Handle login
      Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
    }
  }

  void _register() {
    if (_registerFormKey.currentState!.validate()) {
      // Handle registration
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Account Created'),
          content: const Text('Your account has been created successfully! Please verify your email.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _tabController.animateTo(0); // Switch to login tab
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  void _loginWithGoogle() {
    // Handle Google login
    Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
  }

  void _showForgotPasswordDialog() {
    final emailController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Enter your email address to receive a password reset link.'),
            const SizedBox(height: 16),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
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
                const SnackBar(content: Text('Password reset link sent to your email!')),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }
}

class _AppLogo extends StatelessWidget {
  const _AppLogo();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Theme.of(context).primaryColor,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.directions_car,
            size: 40,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'AUTOAUCTION',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Premium Car Auction Platform',
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}