#!/usr/bin/env node
import { digitalOceanStorage } from '../services/digitalOceanStorage.js';
import { neon } from '@neondatabase/serverless';

async function testPostgreSQL() {
  console.log('🧪 Тестирование подключения к PostgreSQL...');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT version(), now() as current_time`;
    
    console.log('✅ PostgreSQL подключение успешно');
    console.log(`📊 Версия: ${result[0].version}`);
    console.log(`🕐 Время сервера: ${result[0].current_time}`);
    
    // Тест таблиц
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`📋 Найдено таблиц: ${tablesResult.length}`);
    tablesResult.forEach(table => console.log(`  - ${table.table_name}`));
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error.message);
    return false;
  }
}

async function testDigitalOceanSpaces() {
  console.log('\n🧪 Тестирование DigitalOcean Spaces...');
  
  try {
    const isConnected = await digitalOceanStorage.testConnection();
    
    if (isConnected) {
      // Тест загрузки
      const testBuffer = Buffer.from('Test image content');
      const testUrl = await digitalOceanStorage.uploadCarImage(
        testBuffer, 
        99999, 
        'main', 
        'test.jpg'
      );
      
      console.log('✅ Тестовое изображение загружено:', testUrl);
      
      // Тест удаления
      const deleted = await digitalOceanStorage.deleteFile(testUrl);
      if (deleted) {
        console.log('✅ Тестовое изображение удалено');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Ошибка тестирования Spaces:', error.message);
    return false;
  }
}

async function testSMS() {
  console.log('\n🧪 Тестирование SMS API...');
  
  const smsConfig = {
    login: process.env.SMS_LOGIN,
    hash: process.env.SMS_HASH,
    sender: process.env.SMS_SENDER,
    server: process.env.SMS_SERVER
  };
  
  console.log('📋 SMS конфигурация:');
  console.log(`  Логин: ${smsConfig.login ? '✅ Установлен' : '❌ Не установлен'}`);
  console.log(`  Хеш: ${smsConfig.hash ? '✅ Установлен' : '❌ Не установлен'}`);
  console.log(`  Отправитель: ${smsConfig.sender}`);
  console.log(`  Сервер: ${smsConfig.server}`);
  
  // Простой тест доступности API
  try {
    const response = await fetch(smsConfig.server, { method: 'HEAD' });
    console.log(`✅ SMS API доступен (статус: ${response.status})`);
    return true;
  } catch (error) {
    console.error('❌ SMS API недоступен:', error.message);
    return false;
  }
}

async function testEnvironment() {
  console.log('🧪 Проверка переменных окружения...');
  
  const requiredVars = [
    'DATABASE_URL',
    'DO_SPACES_ACCESS_KEY', 
    'DO_SPACES_SECRET_KEY',
    'DO_SPACES_BUCKET',
    'SMS_LOGIN',
    'SMS_HASH'
  ];
  
  let allSet = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? 
      (varName.includes('SECRET') || varName.includes('HASH') ? '***' : 
       varName === 'DATABASE_URL' ? value.substring(0, 30) + '...' : value) : 
      'Не установлено';
    
    console.log(`${status} ${varName}: ${displayValue}`);
    
    if (!value) allSet = false;
  }
  
  return allSet;
}

async function runAllTests() {
  console.log('🚀 Запуск тестов инфраструктуры DigitalOcean\n');
  
  const results = {
    environment: await testEnvironment(),
    postgresql: false,
    spaces: false,
    sms: false
  };
  
  if (results.environment) {
    results.postgresql = await testPostgreSQL();
    results.spaces = await testDigitalOceanSpaces();
    results.sms = await testSMS();
  } else {
    console.log('\n❌ Пропускаем тесты из-за отсутствующих переменных окружения');
  }
  
  console.log('\n📊 Результаты тестирования:');
  console.log(`Environment: ${results.environment ? '✅' : '❌'}`);
  console.log(`PostgreSQL: ${results.postgresql ? '✅' : '❌'}`);
  console.log(`Spaces: ${results.spaces ? '✅' : '❌'}`);
  console.log(`SMS: ${results.sms ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    console.log('\n🎉 Все тесты прошли успешно! Готов к продакшену.');
  } else {
    console.log('\n⚠️ Некоторые тесты не прошли. Проверьте конфигурацию.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Запуск если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testPostgreSQL, testDigitalOceanSpaces, testSMS, testEnvironment };