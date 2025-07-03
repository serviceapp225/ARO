const Database = require('better-sqlite3');

// Подключаемся к базе данных
const db = new Database('autoauction.db');

try {
  // Обновляем баннер "Продай свое авто"
  const updateSellBanner = db.prepare(`
    UPDATE sell_car_banner 
    SET background_image_url = ? 
    WHERE id = 1
  `);
  
  updateSellBanner.run('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');

  // Обновляем рекламную карусель
  const updateCarousel1 = db.prepare(`
    UPDATE advertisement_carousel 
    SET image_url = ? 
    WHERE id = 1
  `);
  
  const updateCarousel2 = db.prepare(`
    UPDATE advertisement_carousel 
    SET image_url = ? 
    WHERE id = 2
  `);
  
  const updateCarousel3 = db.prepare(`
    UPDATE advertisement_carousel 
    SET image_url = ? 
    WHERE id = 3
  `);

  // Реалистичные изображения автомобилей
  updateCarousel1.run('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); // Luxury car
  updateCarousel2.run('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); // Mercedes
  updateCarousel3.run('https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'); // Handshake/Partnership

  console.log('✅ Изображения баннеров успешно обновлены!');
  
} catch (error) {
  console.error('❌ Ошибка при обновлении изображений:', error);
} finally {
  db.close();
}