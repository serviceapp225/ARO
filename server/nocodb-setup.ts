import { spawn } from 'child_process';
import path from 'path';

export async function startNocoDB() {
  const nocodbProcess = spawn('npx', ['nocodb', '--port', '8080'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NC_DB: process.env.DATABASE_URL,
      NC_AUTH_JWT_SECRET: 'autobid-nocodb-secret',
      NC_ADMIN_EMAIL: 'admin@autobid.tj',
      NC_ADMIN_PASSWORD: 'admin123456'
    }
  });

  nocodbProcess.on('error', (error) => {
    console.error('NocoDB process error:', error);
  });

  return nocodbProcess;
}

// Auto-start NocoDB in development
if (process.env.NODE_ENV === 'development') {
  console.log('Starting NocoDB admin panel on port 8080...');
  startNocoDB();
}