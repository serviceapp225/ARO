// Простой тест создания объявления с фотографией
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function testNewListing() {
  try {
    console.log('🚗 Создаем тестовое объявление с фотографией...');
    
    // Создаем простую тестовую base64 фотографию (маленькая прозрачная PNG 1x1 пиксель)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const listingData = {
      make: 'Test',
      model: 'FileSystem',
      year: 2024,
      mileage: 0,
      startingPrice: '1000',
      description: 'Тест файловой системы фотографий',
      fuelType: 'gasoline',
      transmission: 'automatic',
      driveType: 'front_wheel',
      exteriorColor: 'red',
      interiorColor: 'black',
      sellerId: 4,
      bodyType: 'sedan',
      engineSize: 2.0,
      auctionDuration: 7, // 7 дней
      photos: [testImageBase64] // Одна тестовая фотография
    };
    
    const response = await fetch('http://localhost:5000/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '4',
        'x-user-email': '+992 (90) 333-13-32@autoauction.tj'
      },
      body: JSON.stringify(listingData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Объявление создано успешно:', result.id);
      console.log('📁 Фотографии должны быть сохранены в файловой системе');
      
      // Проверяем, создался ли файл
      const expectedPath = `uploads/listings/${Math.floor(result.id / 1000)}/${result.id}/1.jpg`;
      console.log('🔍 Проверяем файл:', expectedPath);
      
      if (fs.existsSync(expectedPath)) {
        console.log('🎉 ФАЙЛ НАЙДЕН! Файловая система работает!');
        const stats = fs.statSync(expectedPath);
        console.log(`📏 Размер файла: ${stats.size} байт`);
      } else {
        console.log('❌ Файл не найден, возможно фото осталось в base64');
      }
      
    } else {
      console.error('❌ Ошибка создания объявления:', result);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testNewListing();