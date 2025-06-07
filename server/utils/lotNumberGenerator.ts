/**
 * Генератор уникальных 6-значных номеров лотов
 */

export function generateRandomLotNumber(): string {
  // Генерируем случайное 6-значное число
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

export function generateUniqueLotNumber(existingNumbers: string[]): string {
  let lotNumber: string;
  let attempts = 0;
  const maxAttempts = 100; // Предотвращаем бесконечный цикл
  
  do {
    lotNumber = generateRandomLotNumber();
    attempts++;
    
    if (attempts > maxAttempts) {
      // Если не можем найти уникальный номер за 100 попыток,
      // используем timestamp с случайными цифрами
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      lotNumber = (timestamp.slice(0, 4) + random);
      break;
    }
  } while (existingNumbers.includes(lotNumber));
  
  return lotNumber;
}