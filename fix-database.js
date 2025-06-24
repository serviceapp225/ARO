const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing database connection after rollback...');

// Force create new database
try {
  console.log('Creating fresh database...');
  execSync('replit database create', { stdio: 'inherit' });
} catch (error) {
  console.log('Database creation command not available, using alternative method');
}

// Check current database
console.log('Current DATABASE_URL host:', process.env.DATABASE_URL?.match(/ep-[^.]*/)?.[0] || 'unknown');

// Create a simple test to verify connection
const testConnection = `
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT 1 as test')
  .then(() => {
    console.log('✅ Database connection working');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  });
`;

fs.writeFileSync('test-db.js', testConnection);

try {
  execSync('node test-db.js', { stdio: 'inherit' });
  console.log('Database is ready');
} catch (error) {
  console.log('Database needs manual intervention');
} finally {
  fs.unlinkSync('test-db.js');
}