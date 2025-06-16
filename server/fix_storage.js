const fs = require('fs');
const path = require('path');

// Простое решение для работы с файловой системой в ES модулях
module.exports = {
  saveData: (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },
  
  loadData: (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },
  
  fileExists: (filePath) => {
    return fs.existsSync(filePath);
  }
};