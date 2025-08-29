// Быстрая проверка базы данных для DigitalOcean
import { neon } from '@neondatabase/serverless';

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'MISSING');

try {
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`SELECT 1 as test`;
  console.log('✅ База подключена успешно');
} catch (error) {
  console.log('❌ Ошибка базы:', error.message);
}