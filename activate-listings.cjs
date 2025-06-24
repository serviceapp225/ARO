const sqlite = require('better-sqlite3');
const fs = require('fs');

async function activateListings() {
  try {
    // Check if database file exists
    if (!fs.existsSync('./autobid.db')) {
      console.error('Database file not found');
      return;
    }

    const db = sqlite('./autobid.db');
    
    // Update listings to active status
    const updateStmt = db.prepare('UPDATE carListings SET status = ? WHERE id = ?');
    
    const result3 = updateStmt.run('active', 3);
    const result4 = updateStmt.run('active', 4);
    
    console.log('Listing 3 updated:', result3.changes > 0 ? 'Success' : 'Not found');
    console.log('Listing 4 updated:', result4.changes > 0 ? 'Success' : 'Not found');
    
    // Verify updates
    const selectStmt = db.prepare('SELECT id, make, model, status FROM carListings WHERE id IN (3, 4)');
    const listings = selectStmt.all();
    
    console.log('Current status:');
    listings.forEach(listing => {
      console.log(`- ${listing.make} ${listing.model} (ID: ${listing.id}): ${listing.status}`);
    });
    
    db.close();
    console.log('Listings activated successfully!');
  } catch (error) {
    console.error('Error activating listings:', error);
  }
}

activateListings();