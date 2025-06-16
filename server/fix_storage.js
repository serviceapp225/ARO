import { readFileSync, writeFileSync, existsSync } from 'fs';

// Простое решение для работы с файловой системой в ES модулях
export default {
  saveData: (filePath, data) => {
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },
  
  loadData: (filePath) => {
    try {
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },
  
  fileExists: (filePath) => {
    return existsSync(filePath);
  }
};