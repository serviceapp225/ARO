
import { initializeDatabaseWithSampleData } from './server/initDatabase.js';
initializeDatabaseWithSampleData().then(() => {
  console.log('✅ Данные восстановлены успешно!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Ошибка восстановления:', err);
  process.exit(1);
});

