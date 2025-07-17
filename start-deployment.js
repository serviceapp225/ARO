#!/usr/bin/env node

/**
 * DEPLOYMENT STARTUP SCRIPT
 * 
 * This script handles the deployment startup process by:
 * 1. Setting the correct environment variables for production
 * 2. Ensuring the correct file (index.cjs) is executed
 * 3. Setting up proper port configuration
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🚀 Starting deployment server...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

// Check if the deployment server file exists
const deploymentFile = path.join(process.cwd(), 'dist', 'index.cjs');

if (!existsSync(deploymentFile)) {
  console.error('❌ Deployment file dist/index.cjs not found!');
  console.log('🔧 Please run: node build-deployment.cjs');
  process.exit(1);
}

console.log('✅ Deployment file found');
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔌 Port: ${process.env.PORT}`);

// Execute the deployment server
try {
  execSync(`node ${deploymentFile}`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start deployment server:', error.message);
  process.exit(1);
}