const Database = require('better-sqlite3');
const path = require('path');

try {
  // Connect to SQLite database
  const dbPath = path.join(__dirname, 'autobid.db');
  const db = new Database(dbPath);
  
  // Clear test car listings
  const result = db.prepare('DELETE FROM car_listings').run();
  console.log(`Deleted ${result.changes} car listings`);
  
  // Clear related data
  const bidsResult = db.prepare('DELETE FROM bids').run();
  console.log(`Deleted ${bidsResult.changes} bids`);
  
  const favoritesResult = db.prepare('DELETE FROM favorites').run();
  console.log(`Deleted ${favoritesResult.changes} favorites`);
  
  db.close();
  console.log('Test data cleared successfully');
} catch (error) {
  console.error('Error clearing test data:', error);
}